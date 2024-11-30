1. モデル (notifications/models.py):
```python
- ShiftSubmissionForm: シフト提出フォームの情報を管理
  - deadline: 締切日時
  - form_url: フォームのURL
  - message: メッセージ
  - is_template: テンプレートかどうか
  - sent_at: 送信日時

- ShiftNotification: シフトのPDF通知を管理
  - pdf_file: アップロードされたPDFファイル 
  - image_file: PDFから変換された画像
  - message: メッセージ
  - sent_at: 送信日時
```

2. URLルーティング (notifications/urls.py):
```python
- /api/notifications/send-shift-form/: シフト提出フォームの送信
- /api/notifications/send-shift-notification/: シフト通知の送信
```

3. ビュー (notifications/views.py):
```python
- send_shift_form(): LINE APIを使ってシフト提出フォームをグループに送信
- send_shift_notification(): PDFをアップロード→画像に変換→LINE APIでグループに送信
```


- シフト提出フォームのURLをLINEグループに送信
- シフトPDFをアップロードして画像に変換し、LINEグループに送信
