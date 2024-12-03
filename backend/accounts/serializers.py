from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'id',
            'name',
            'password',
            'can_open',
            'can_close_cleaning',
            'can_close_cashier',
            'can_close_floor',
            'can_order',
            'is_beginner',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']