from rest_framework import status, views, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.utils import timezone
from accounts.models import Employee
from .models import (
    TimePreset, ShiftSubmissionStatus, DraftShiftRequest,
    DraftShiftDetail, ShiftRequest, ShiftDetail
)
from .serializers import (
    TimePresetSerializer, DraftShiftRequestSerializer,
    ShiftRequestSerializer, HistoricalShiftRequestSerializer
)

class TimePresetListCreateView(generics.ListCreateAPIView):
    serializer_class = TimePresetSerializer

    def get_queryset(self):
        employee_id = self.kwargs['employee_id']
        return TimePreset.objects.filter(employee_id=employee_id)

    def perform_create(self, serializer):
        employee_id = self.kwargs['employee_id']
        serializer.save(employee_id=employee_id)

class TimePresetDetailView(views.APIView):
    def get(self, request, employee_id, preset_id):
        """特定のプリセットを取得"""
        preset = get_object_or_404(TimePreset, employee_id=employee_id, id=preset_id)
        serializer = TimePresetSerializer(preset)
        return Response(serializer.data)

    def put(self, request, employee_id, preset_id):
        """プリセットを更新"""
        preset = get_object_or_404(TimePreset, employee_id=employee_id, id=preset_id)
        serializer = TimePresetSerializer(preset, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, employee_id, preset_id):
        """プリセットを削除"""
        preset = get_object_or_404(TimePreset, employee_id=employee_id, id=preset_id)
        preset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TimePresetView(views.APIView):
    def get(self, request, employee_id):
        """従業員のプリセット一覧を取得"""
        presets = TimePreset.objects.filter(employee_id=employee_id)
        serializer = TimePresetSerializer(presets, many=True)
        return Response(serializer.data)

    def post(self, request, employee_id):
        """新しいプリセットを作成"""
        serializer = TimePresetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(employee_id=employee_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DraftShiftView(views.APIView):
    def get(self, request, employee_id, year, month):
        """下書きシフトの取得"""
        employee = get_object_or_404(Employee, id=employee_id)
        
        # シフト提出状況を確認
        status_obj = ShiftSubmissionStatus.get_or_create_for_month(employee, year, month)
        if status_obj.is_submitted:
            return Response({
                "submitted": True,
                "message": "今月のシフトは提出済です。"
            })

        # 下書きを取得（月初めの場合はリセット）
        draft = DraftShiftRequest.get_or_create_for_month(employee, year, month)
        serializer = DraftShiftRequestSerializer(draft)
        return Response(serializer.data)

    def post(self, request, employee_id, year, month):
        """下書きシフトの保存"""
        employee = get_object_or_404(Employee, id=employee_id)
        
        # シフト提出状況を確認
        status_obj = ShiftSubmissionStatus.get_or_create_for_month(employee, year, month)
        if status_obj.is_submitted:
            return Response({
                "submitted": True,
                "message": "今月のシフトは提出済です。"
            }, status=status.HTTP_400_BAD_REQUEST)

        draft = DraftShiftRequest.get_or_create_for_month(employee, year, month)
        
        # 基本情報の更新
        for field in ['min_hours', 'max_hours', 'min_days_per_week', 'max_days_per_week']:
            if field in request.data:
                setattr(draft, field, request.data[field])
        draft.save()

        # シフト詳細の更新
        if 'shift_details' in request.data:
            DraftShiftDetail.objects.filter(draft=draft).delete()
            for detail in request.data['shift_details']:
                DraftShiftDetail.objects.create(
                    draft=draft,
                    date=detail['date'],
                    start_time=detail.get('start_time'),
                    end_time=detail.get('end_time'),
                    is_holiday=detail.get('is_holiday', False),
                    color=detail.get('color')
                )

        serializer = DraftShiftRequestSerializer(draft)
        return Response(serializer.data)

class SubmitShiftView(views.APIView):
    def post(self, request, employee_id, year, month):
        """シフトの最終提出"""
        employee = get_object_or_404(Employee, id=employee_id)
        
        # シフト提出状況を確認
        status_obj = ShiftSubmissionStatus.get_or_create_for_month(employee, year, month)
        if status_obj.is_submitted:
            return Response({
                "submitted": True,
                "message": "今月のシフトは提出済です。"
            }, status=status.HTTP_400_BAD_REQUEST)

        # 下書きデータの取得
        draft = get_object_or_404(
            DraftShiftRequest,
            employee=employee,
            year=year,
            month=month
        )

        serializer = ShiftRequestSerializer(
            data=request.data,
            context={
                'employee_id': employee_id,
                'year': year,
                'month': month
            }
        )
        
        if serializer.is_valid():
            try:
                shift_request = serializer.save()
                
                # 提出状況を更新
                status_obj.is_submitted = True
                status_obj.submitted_at = timezone.now()
                status_obj.save()
                
                # 下書きデータを削除
                draft.delete()
                
                return Response({
                    "message": "シフトを提出しました。",
                    "shift": serializer.data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    "error": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HistoricalShiftView(views.APIView):
    def get(self, request, employee_id):
        """過去のシフト履歴の取得"""
        employee = get_object_or_404(Employee, id=employee_id)
        
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        queryset = ShiftRequest.objects.filter(employee=employee)
        
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)
            
        queryset = queryset.order_by('-year', '-month')
        
        serializer = HistoricalShiftRequestSerializer(queryset, many=True)
        return Response(serializer.data)

@api_view(['PUT'])
def update_shift(request, employee_id):
    try:
        # Get the shift request for the specified month
        shift_request = ShiftRequest.objects.get(
            employee_id=employee_id,
            year=request.data.get('year'),
            month=request.data.get('month')
        )
        
        # Find or create the shift detail for the specified date
        shift_detail, created = ShiftDetail.objects.get_or_create(
            shift_request=shift_request,
            date=request.data.get('date')
        )
        
        # Update the shift detail
        shift_detail.start_time = request.data.get('start_time')
        shift_detail.end_time = request.data.get('end_time')
        shift_detail.is_holiday = request.data.get('is_holiday')
        shift_detail.save()
        
        return Response({
            'message': 'シフトを更新しました',
            'detail': {
                'date': shift_detail.date,
                'start_time': shift_detail.start_time,
                'end_time': shift_detail.end_time,
                'is_holiday': shift_detail.is_holiday
            }
        })
        
    except ShiftRequest.DoesNotExist:
        return Response(
            {'error': 'シフトが見つかりません'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )