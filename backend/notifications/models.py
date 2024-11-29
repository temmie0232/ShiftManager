from django.db import models

class ShiftSubmissionForm(models.Model):
    deadline = models.DateTimeField()
    form_url = models.URLField()
    message = models.TextField()
    is_template = models.BooleanField(default=True)
    sent_at = models.DateTimeField(auto_now_add=True)

class ShiftNotification(models.Model):
    pdf_file = models.FileField(upload_to='shifts/pdfs/')
    image_file = models.ImageField(upload_to='shifts/images/')
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)