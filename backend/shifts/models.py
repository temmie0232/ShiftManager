from django.db import models
from django.utils import timezone
from accounts.models import Employee

class TimePreset(models.Model):
    """時間帯のプリセット"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    color = models.CharField(max_length=50, default='#a5d6a7')  # デフォルトの色を設定
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

class ShiftSubmissionStatus(models.Model):
    """シフト提出状況の管理"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField()
    is_submitted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['employee', 'year', 'month']

    @classmethod
    def get_or_create_for_month(cls, employee, year, month):
        """指定月のステータスを取得または作成"""
        today = timezone.now()
        first_day_current = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        target_date = today.replace(year=year, month=month, day=1)
        
        if target_date == first_day_current:
            status, created = cls.objects.get_or_create(
                employee=employee,
                year=year,
                month=month
            )
            if not created and status.is_submitted:
                status.is_submitted = False
                status.submitted_at = None
                status.save()
            return status
        
        return cls.objects.get_or_create(
            employee=employee,
            year=year,
            month=month
        )[0]

class DraftShiftRequest(models.Model):
    """下書き状態のシフトリクエスト"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField()
    min_hours = models.IntegerField(null=True, blank=True)
    max_hours = models.IntegerField(null=True, blank=True)
    min_days_per_week = models.IntegerField(null=True, blank=True)
    max_days_per_week = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['employee', 'year', 'month']

    @classmethod
    def get_or_create_for_month(cls, employee, year, month):
        """指定月の下書きを取得または作成（月初めの場合はリセット）"""
        today = timezone.now()
        first_day_current = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        target_date = today.replace(year=year, month=month, day=1)
        
        if target_date == first_day_current:
            # 既存の下書きを削除
            cls.objects.filter(
                employee=employee,
                year=year,
                month=month
            ).delete()

            # 前回の希望時間・日数を取得
            last_request = ShiftRequest.objects.filter(
                employee=employee
            ).order_by('-year', '-month').first()

            # 新しい下書きを作成
            if last_request:
                return cls.objects.create(
                    employee=employee,
                    year=year,
                    month=month,
                    min_hours=last_request.min_hours,
                    max_hours=last_request.max_hours,
                    min_days_per_week=last_request.min_days_per_week,
                    max_days_per_week=last_request.max_days_per_week
                )
            
            return cls.objects.create(
                employee=employee,
                year=year,
                month=month
            )
        
        draft, created = cls.objects.get_or_create(
            employee=employee,
            year=year,
            month=month
        )
        return draft

class DraftShiftDetail(models.Model):
    """下書きシフトの詳細"""
    draft = models.ForeignKey(DraftShiftRequest, on_delete=models.CASCADE, related_name='shift_details')
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    is_holiday = models.BooleanField(default=False)
    color = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        unique_together = ['draft', 'date']
        ordering = ['date']

class ShiftRequest(models.Model):
    """確定したシフトリクエスト"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField()
    min_hours = models.IntegerField()
    max_hours = models.IntegerField()
    min_days_per_week = models.IntegerField()
    max_days_per_week = models.IntegerField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['employee', 'year', 'month']
        indexes = [
            models.Index(fields=['employee', 'year', 'month']),
            models.Index(fields=['year', 'month']),
        ]
        ordering = ['-year', '-month']

class ShiftDetail(models.Model):
    """確定したシフトリクエストの詳細"""
    shift_request = models.ForeignKey(ShiftRequest, on_delete=models.CASCADE, related_name='shift_details')
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    is_holiday = models.BooleanField(default=False)
    color = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        unique_together = ['shift_request', 'date']
        ordering = ['date']