from django.db import models

class Case(models.Model):
    case_id = models.CharField(max_length=100, unique=True)
    # other fields ...

class File(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=255)
    filetype = models.CharField(max_length=50)
    path = models.FileField(upload_to='uploads/raw/')
    anonymized_path = models.FileField(upload_to='uploads/anonymized/', null=True, blank=True)
    is_dicom = models.BooleanField(default=False)
    modality = models.CharField(max_length=50, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)