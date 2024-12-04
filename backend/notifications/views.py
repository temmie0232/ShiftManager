# 必要なライブラリのインポート
import logging
import os
import tempfile
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from linebot import LineBotApi
from linebot.models import TextSendMessage, ImageSendMessage
import fitz  # PyMuPDFライブラリ
from PIL import Image
import tempfile
import os
from django.core.files import File
from notifications.models import ShiftNotification, ShiftSubmissionForm
from django.utils import timezone
from django.conf import settings

# LINE Bot APIの初期化
line_bot_api = LineBotApi(os.getenv('LINE_CHANNEL_ACCESS_TOKEN'))
GROUP_ID = os.getenv('LINE_GROUP_ID')

logger = logging.getLogger(__name__)

# シフト提出フォームの送信エンドポイント
@csrf_exempt
@api_view(['POST'])
def send_shift_form(request):
    try:
        # リクエストデータをログに出力
        logger.info("Received data: %s", request.data)
        
        # バリデーション
        if not request.data.get('message'):
            return JsonResponse({
                'status': 'error',
                'message': 'メッセージは必須です'
            }, status=400)
        
        if not request.data.get('form_url'):
            return JsonResponse({
                'status': 'error',
                'message': 'フォームURLは必須です'
            }, status=400)

        # フォームデータをデータベースに保存
        form = ShiftSubmissionForm.objects.create(
            deadline=timezone.now() + timezone.timedelta(days=30),
            form_url=request.data['form_url'],
            message=request.data['message'],
            is_template=request.data.get('is_template', True)
        )

        # LINE BOTの初期化を確認
        if not os.getenv('LINE_CHANNEL_ACCESS_TOKEN'):
            raise ValueError("LINE_CHANNEL_ACCESS_TOKEN が設定されていません")
        if not os.getenv('LINE_GROUP_ID'):
            raise ValueError("LINE_GROUP_ID が設定されていません")
        
        # LINEグループにメッセージとURLを送信
        line_bot_api.push_message(
            GROUP_ID,
            TextSendMessage(text=f"{form.message}\n{form.form_url}")
        )
        
        return JsonResponse({'status': 'success'})
        
    except Exception as e:
        logger.error("Error in send_shift_form: %s", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

# シフト通知の送信エンドポイント
@csrf_exempt
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def send_shift_notification(request):
    try:
        if 'file' not in request.FILES:
            return JsonResponse({
                'status': 'error',
                'message': 'PDFファイルが必要です'
            }, status=400)

        # メディアディレクトリの存在確認
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'shifts/pdfs'), exist_ok=True)
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'shifts/images'), exist_ok=True)

        # PDFファイルとメッセージを保存
        notification = ShiftNotification(
            pdf_file=request.FILES['file'],
            message=request.POST.get('message', '')
        )
        notification.save()
        
        try:
            # PDFファイルを画像に変換
            pdf_document = fitz.open(notification.pdf_file.path)
            
            # 一時ファイルを作成
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_image:
                # 最初のページのみを処理
                page = pdf_document[0]
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # type: ignore
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples) # type: ignore
                img.save(temp_image.name, 'JPEG', quality=85)
                
                # 画像をモデルに保存
                notification.image_file.save(
                    f'shift_page_0.jpg',
                    File(open(temp_image.name, 'rb'))
                )
                
                # 一時ファイルを削除
                temp_image_path = temp_image.name

            # PDFを閉じる
            pdf_document.close()
            
            # 一時ファイルを削除
            if os.path.exists(temp_image_path):
                os.unlink(temp_image_path)
            
            # LINEにメッセージを送信
            if notification.message:
                line_bot_api.push_message(
                    GROUP_ID,
                    TextSendMessage(text=notification.message)
                )

            # 画像のURLを生成して送信
            image_url = request.build_absolute_uri(notification.image_file.url)
            
            line_bot_api.push_message(
                GROUP_ID,
                ImageSendMessage(
                    original_content_url=image_url,
                    preview_image_url=image_url
                )
            )

            return JsonResponse({'status': 'success'})

        except Exception as e:
            # エラー時は作成したファイルを削除
            if notification.pdf_file:
                if os.path.exists(notification.pdf_file.path):
                    os.remove(notification.pdf_file.path)
            if notification.image_file:
                if os.path.exists(notification.image_file.path):
                    os.remove(notification.image_file.path)
            notification.delete()
            raise e

    except Exception as e:
        logger.error("Error in send_shift_notification: %s", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)