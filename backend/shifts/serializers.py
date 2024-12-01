from rest_framework import serializers
from .models import (
    TimePreset, ShiftSubmissionStatus, DraftShiftRequest,
    DraftShiftDetail, ShiftRequest, ShiftDetail
)

class TimePresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimePreset
        fields = ['id', 'name', 'start_time', 'end_time', 'color']

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
        fields = ['date', 'start_time', 'end_time', 'is_holiday', 'color']

class ShiftRequestSerializer(serializers.ModelSerializer):
    shift_details = ShiftDetailSerializer(many=True)

    class Meta:
        model = ShiftRequest
        fields = [
            'id', 'year', 'month', 'min_hours', 'max_hours',
            'min_days_per_week', 'max_days_per_week', 'shift_details',
            'submitted_at'
        ]

    def create(self, validated_data):
        details_data = validated_data.pop('shift_details')
        shift_request = ShiftRequest.objects.create(**validated_data)
        
        for detail_data in details_data:
            ShiftDetail.objects.create(shift_request=shift_request, **detail_data)
        
        return shift_request

class HistoricalShiftRequestSerializer(serializers.ModelSerializer):
    shift_details = ShiftDetailSerializer(many=True)
    
    class Meta:
        model = ShiftRequest
        fields = [
            'id', 'year', 'month', 'min_hours', 'max_hours',
            'min_days_per_week', 'max_days_per_week', 'shift_details',
            'submitted_at'
        ]