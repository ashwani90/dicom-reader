from rest_framework import serializers
from .models import CaseRequest, File, Case
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff"]
        read_only_fields = ["id", "is_staff"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", "")
        )
        return user

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

class CaseRequestSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)
    receiver_name = serializers.CharField(source="receiver.username", read_only=True)
    case_number = serializers.CharField(source="case.case_id", read_only=True)
    case_title = serializers.CharField(source="case.title", read_only=True)
    case_id = serializers.CharField(source="case.id", read_only=True)
    files = FileSerializer(many=True, read_only=True)

    class Meta:
        model = CaseRequest
        fields = [
            "id",
            "case",
            "case_number",
            "sender",
            "sender_name",
            "receiver",
            "receiver_name",
            "case_title",
            "case_id",
            "files",
            "message",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at", "sender"]
