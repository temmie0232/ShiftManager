from django.db import models

class ShiftRequest(models.Model):
    employee = models.ForeignKey('accounts.Employee', on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class MonthlyPreference(models.Model):
    employee = models.ForeignKey('accounts.Employee', on_delete=models.CASCADE)
    year_month = models.DateField()
    min_hours = models.IntegerField()
    max_hours = models.IntegerField()
    min_days_per_week = models.IntegerField()
    max_days_per_week = models.IntegerField()

class ConfirmedShift(models.Model):
    employee = models.ForeignKey('accounts.Employee', on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)