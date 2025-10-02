from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = [
            "id", "filename", "filetype", "path",
            "anonymized_path", "is_dicom", "modality", "uploaded_at"
        ]