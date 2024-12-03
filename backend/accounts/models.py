from django.db import models

class Employee(models.Model):
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=4, null=True, blank=True)
    can_open = models.BooleanField(default=False)
    can_close_cleaning = models.BooleanField(default=False)
    can_close_cashier = models.BooleanField(default=False)
    can_close_floor = models.BooleanField(default=False)
    can_order = models.BooleanField(default=False)
    is_beginner = models.BooleanField(default=False) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)