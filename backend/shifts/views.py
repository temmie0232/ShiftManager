from rest_framework import status, views, generics
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from accounts.models import Employee
from .models import (
    TimePreset, ShiftSubmissionStatus, DraftShiftRequest,
    DraftShiftDetail, ShiftRequest
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

class TimePresetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TimePresetSerializer
    lookup_url_kwarg = 'preset_id'

    def get_queryset(self):
        employee_id = self.kwargs['employee_id']
        return TimePreset.objects.filter(employee_id=employee_id)

class DraftShiftView(views.APIView):
    def get(self, request, employee_id):
        """下書きシフトの取得"""
        employee = get_object_or_404(Employee, id=employee_id)
        next_month = timezone.now().replace(day=1) + timezone.timedelta(days=32)
        year = next_month.year
        month = next_month.month

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

    def post(self, request, employee_id):
        """下書きシフトの保存"""
        employee = get_object_or_404(Employee, id=employee_id)
        next_month = timezone.now().replace(day=1) + timezone.timedelta(days=32)
        year = next_month.year
        month = next_month.month
        
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
    def post(self, request, employee_id):
        """シフトの最終提出"""
        employee = get_object_or_404(Employee, id=employee_id)
        next_month = timezone.now().replace(day=1) + timezone.timedelta(days=32)
        year = next_month.year
        month = next_month.month
        
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

        # シフトリクエストの作成
        shift_request_data = {
            'employee': employee,
            'year': year,
            'month': month,
            'min_hours': draft.min_hours,
            'max_hours': draft.max_hours,
            'min_days_per_week': draft.min_days_per_week,
            'max_days_per_week': draft.max_days_per_week,
        }
        
        # 詳細データの準備
        details_data = [{
            'date': detail.date,
            'start_time': detail.start_time,
            'end_time': detail.end_time,
            'is_holiday': detail.is_holiday,
            'color': detail.color,
        } for detail in DraftShiftDetail.objects.filter(draft=draft)]

        # シリアライザでデータを検証
        serializer = ShiftRequestSerializer(data={
            **shift_request_data,
            'shift_details': details_data
        })
        
        if serializer.is_valid():
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
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HistoricalShiftView(views.APIView):
    def get(self, request, employee_id):
        """過去のシフト履歴の取得"""
        employee = get_object_or_404(Employee, id=employee_id)
        
        # クエリパラメータから年と月を取得
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