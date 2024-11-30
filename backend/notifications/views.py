# 必要なライブラリのインポート
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

# LINE Bot APIの初期化
line_bot_api = LineBotApi(os.getenv('LINE_CHANNEL_ACCESS_TOKEN'))
GROUP_ID = os.getenv('LINE_GROUP_ID')

# シフト提出フォームの送信エンドポイント
@csrf_exempt  # CSRFトークン検証を無効化
@api_view(['POST'])  # POSTメソッドのみ許可
def send_shift_form(request):
    try:
        # リクエストデータをログに出力
        print("Received data:", request.data)
        
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
            deadline=timezone.now() + timezone.timedelta(days=30),  # デフォルトの期限を1週間後に設定
            form_url=request.data['form_url'],
            message=request.data['message'],
            is_template=request.data.get('is_template', True)
        )

        # LINE BOTの初期化を確認
        if not os.getenv('LINE_CHANNEL_ACCESS_TOKEN'):
            raise ValueError("LINE_CHANNEL_ACCESS_TOKEN が設定されていません")
        if not os.getenv('LINE_GROUP_ID'):
            raise ValueError("LINE_GROUP_ID が設定されていません")
        
        line_bot_api = LineBotApi(os.getenv('LINE_CHANNEL_ACCESS_TOKEN'))
        
        # LINEグループにメッセージとURLを送信
        line_bot_api.push_message(
            os.getenv('LINE_GROUP_ID'),
            TextSendMessage(text=f"{form.message}\n{form.form_url}")
        )
        
        return JsonResponse({'status': 'success'})
        
    except ValueError as ve:
        print("Validation error:", str(ve))
        return JsonResponse({
            'status': 'error',
            'message': str(ve)
        }, status=400)
    except Exception as e:
        print("Server error:", str(e))
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
        # PDFファイルとメッセージを保存
        notification = ShiftNotification(
            pdf_file=request.FILES['file'],
            message=request.POST.get('message', '')
        )
        notification.save()
        
        # PDFファイルを画像に変換
        pdf_document = fitz.open(notification.pdf_file.path)
        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            # 2倍のスケールの画像を生成
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # type: ignore
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples) # type: ignore
            
            # 一時ファイルとして画像を保存
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_image:
                img.save(temp_image.name, 'JPEG', quality=85)
                # 最初のページのみをモデルに保存
                if page_num == 0:
                    notification.image_file.save(
                        f'shift_page_{page_num}.jpg',
                        File(open(temp_image.name, 'rb'))
                    )
            
            # 一時ファイルを削除してクリーンアップ
            os.unlink(temp_image.name)
        
        pdf_document.close()
        
        # テキストメッセージがある場合は送信
        if notification.message:
            line_bot_api.push_message(
                GROUP_ID,
                TextSendMessage(text=notification.message)
            )
        
        # 画像のURLを生成して送信
        original_url = request.build_absolute_uri(notification.image_file.url)
        preview_url = original_url
        
        line_bot_api.push_message(
            GROUP_ID,
            ImageSendMessage(
                original_content_url=original_url,
                preview_image_url=preview_url
            )
        )
        
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)