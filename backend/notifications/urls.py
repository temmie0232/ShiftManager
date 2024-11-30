from django.urls import path
from . import views

# APIエンドポイントの定義
urlpatterns = [
    path('send-shift-form/', views.send_shift_form, name='send_shift_form'),
    path('send-shift-notification/', views.send_shift_notification, name='send_shift_notification'),
]