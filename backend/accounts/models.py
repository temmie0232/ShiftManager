from django.db import models

class Employee(models.Model):
    name = models.CharField(max_length=100)
    can_open = models.BooleanField(default=False)
    can_close_cleaning = models.BooleanField(default=False)
    can_close_cashier = models.BooleanField(default=False)
    can_close_floor = models.BooleanField(default=False)
    can_order = models.BooleanField(default=False)
    is_beginner_1 = models.BooleanField(default=False)  # 完全な新人
    is_beginner_2 = models.BooleanField(default=False)  # ある程度経験を積んだ新人
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)