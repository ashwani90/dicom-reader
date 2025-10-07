from rest_framework import serializers
from .models import File, Case

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = [
            "id", "filename", "filetype", "path",
            "anonymized_path", "is_dicom", "modality", "uploaded_at"
        ]
        
class CaseSerializer(serializers.ModelSerializer):
    files = FileSerializer(many=True, read_only=True)

    class Meta:
        model = Case
        fields = [
            "id", "case_id", "title", "description", "patient_name",
            "patient_id", "patient_age", "patient_sex", "diagnosis",
            "created_by", "created_at", "updated_at", "files"
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]