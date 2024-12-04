from rest_framework import serializers
from .models import (
    TimePreset, ShiftSubmissionStatus, DraftShiftRequest,
    DraftShiftDetail, ShiftRequest, ShiftDetail
)

class TimePresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimePreset
        fields = ['id', 'name', 'start_time', 'end_time', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """
        開始時間が終了時間より後になっていないかチェック
        """
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("開始時間は終了時間より前である必要があります")
        return data

class ShiftSubmissionStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftSubmissionStatus
        fields = ['is_submitted', 'submitted_at']

class DraftShiftDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = DraftShiftDetail
        fields = ['date', 'start_time', 'end_time', 'is_holiday', 'color']

class DraftShiftRequestSerializer(serializers.ModelSerializer):
    shift_details = DraftShiftDetailSerializer(many=True, read_only=True)
    submission_status = serializers.SerializerMethodField()

    class Meta:
        model = DraftShiftRequest
        fields = [
            'id', 'year', 'month', 'min_hours', 'max_hours',
            'min_days_per_week', 'max_days_per_week', 'shift_details',
            'submission_status'
        ]

    def get_submission_status(self, obj):
        status = ShiftSubmissionStatus.objects.filter(
            employee=obj.employee,
            year=obj.year,
            month=obj.month
        ).first()
        return ShiftSubmissionStatusSerializer(status).data if status else None

class ShiftDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftDetail
        fields = ['date', 'start_time', 'end_time', 'is_holiday']

class ShiftRequestSerializer(serializers.ModelSerializer):
    shift_details = ShiftDetailSerializer(many=True)

    class Meta:
        model = ShiftRequest
        fields = [
            'min_hours', 
            'max_hours',
            'min_days_per_week', 
            'max_days_per_week',
            'shift_details',
            'year',
            'month'
        ]
        read_only_fields = ['year', 'month']

    def create(self, validated_data):
        # employee_idをコンテキストから取得
        employee_id = self.context.get('employee_id')
        if not employee_id:
            raise serializers.ValidationError("Employee ID is required")

        # シフト詳細データを取り出す
        shift_details_data = validated_data.pop('shift_details')

        # year と month をコンテキストから取得
        year = self.context.get('year')
        month = self.context.get('month')

        # ShiftRequestを作成
        shift_request = ShiftRequest.objects.create(
            employee_id=employee_id,
            year=year,
            month=month,
            **validated_data
        )

        # シフト詳細を作成
        for detail_data in shift_details_data:
            ShiftDetail.objects.create(
                shift_request=shift_request,
                **detail_data
            )

        return shift_request

    def validate(self, data):
        if data['min_hours'] > data['max_hours']:
            raise serializers.ValidationError("Minimum hours cannot be greater than maximum hours")
        if data['min_days_per_week'] > data['max_days_per_week']:
            raise serializers.ValidationError("Minimum days per week cannot be greater than maximum days per week")
        return data

class HistoricalShiftRequestSerializer(serializers.ModelSerializer):
    shift_details = ShiftDetailSerializer(many=True)
    
    class Meta:
        model = ShiftRequest
        fields = [
            'id', 'year', 'month', 'min_hours', 'max_hours',
            'min_days_per_week', 'max_days_per_week', 'shift_details',
            'submitted_at'
        ]