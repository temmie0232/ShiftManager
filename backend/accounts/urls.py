from django.urls import path
from . import views

urlpatterns = [
    path('employees/', views.EmployeeListCreate.as_view(), name='employee-list-create'),
    path('employees/<int:pk>/', views.EmployeeRetrieveUpdateDestroy.as_view(), name='employee-detail'),
    path('employees/<int:employee_id>/set-password/', views.set_password, name='set-password'),
    path('employees/<int:employee_id>/verify-password/', views.verify_password, name='verify-password'),
]