from django.urls import path
from . import views

urlpatterns = [
    # プリセット関連
    path('presets/<int:employee_id>/',
         views.TimePresetListCreateView.as_view(),
         name='timepreset-list'),
    path('presets/<int:employee_id>/<int:preset_id>/',
         views.TimePresetDetailView.as_view(),
         name='timepreset-detail'),
    
    # 下書きシフト関連
    path('draft/<int:employee_id>/<int:year>/<int:month>/',
         views.DraftShiftView.as_view(),
         name='draft-shift'),
    
    # シフト提出
    path('submit/<int:employee_id>/<int:year>/<int:month>/',
         views.SubmitShiftView.as_view(),
         name='submit-shift'),
         
    # シフト履歴
    path('history/<int:employee_id>/',
         views.HistoricalShiftView.as_view(),
         name='shift-history'),
]