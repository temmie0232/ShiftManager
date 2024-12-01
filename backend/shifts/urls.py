from django.urls import path
from . import views

urlpatterns = [
    # プリセット関連
    path('employees/<int:employee_id>/presets/',
         views.TimePresetListCreateView.as_view(),
         name='timepreset-list'),
    path('employees/<int:employee_id>/presets/<int:preset_id>/',
         views.TimePresetDetailView.as_view(),
         name='timepreset-detail'),
    
    # 下書きシフト関連
    path('employees/<int:employee_id>/drafts/<int:year>/<int:month>/',
         views.DraftShiftView.as_view(),
         name='draft-shift'),
    
    # シフト提出
    path('employees/<int:employee_id>/submit/<int:year>/<int:month>/',
         views.SubmitShiftView.as_view(),
         name='submit-shift'),
         
    # シフト履歴
    path('employees/<int:employee_id>/history/',
         views.HistoricalShiftView.as_view(),
         name='shift-history'),
]