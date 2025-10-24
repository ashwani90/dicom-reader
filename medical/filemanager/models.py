from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Case(models.Model):
    """
    Represents a medical imaging case that can include multiple DICOM files.
    """
    case_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="cases")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    patient_name = models.CharField(max_length=255, blank=True, null=True)
    patient_id = models.CharField(max_length=255, blank=True, null=True)
    patient_age = models.CharField(max_length=20, blank=True, null=True)
    patient_sex = models.CharField(max_length=10, blank=True, null=True)
    diagnosis = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Case {self.case_id}"

class File(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=255)
    filetype = models.CharField(max_length=50)
    path = models.FileField(upload_to='uploads/raw/')
    anonymized_path = models.FileField(upload_to='uploads/anonymized/', null=True, blank=True)
    is_dicom = models.BooleanField(default=False)
    modality = models.CharField(max_length=50, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
class DicomMetadata(models.Model):
    file = models.OneToOneField(
        "File",  # assuming you already have a File model
        on_delete=models.CASCADE,
        related_name="dicom_metadata"
    )

    # Patient details
    patient_name = models.CharField(max_length=255, blank=True)
    patient_id = models.CharField(max_length=255, blank=True)
    patient_sex = models.CharField(max_length=10, blank=True)
    patient_birth_date = models.CharField(max_length=20, blank=True)
    patient_age = models.CharField(max_length=20, blank=True)

    # Study information
    study_instance_uid = models.CharField(max_length=255, blank=True)
    study_id = models.CharField(max_length=255, blank=True)
    study_date = models.CharField(max_length=50, blank=True)
    study_time = models.CharField(max_length=50, blank=True)
    accession_number = models.CharField(max_length=255, blank=True)
    study_description = models.TextField(blank=True)

    # Series information
    series_instance_uid = models.CharField(max_length=255, blank=True)
    series_number = models.CharField(max_length=50, blank=True)
    series_description = models.TextField(blank=True)
    modality = models.CharField(max_length=50, blank=True)
    manufacturer = models.CharField(max_length=255, blank=True)
    institution_name = models.CharField(max_length=255, blank=True)

    # Other
    body_part_examined = models.CharField(max_length=255, blank=True)
    protocol_name = models.CharField(max_length=255, blank=True)
    kvp = models.CharField(max_length=50, blank=True)
    slice_thickness = models.CharField(max_length=50, blank=True)
    pixel_spacing = models.CharField(max_length=50, blank=True)
    rows = models.CharField(max_length=50, blank=True)
    columns = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"DICOM Metadata for {self.file.filename}"
    
class CaseRequest(models.Model):
    """
    Represents a request to share or review a case between users.
    A request can include specific DICOM files or the entire case.
    """

    REQUEST_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ]

    # Core relationships
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="requests"
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_requests"
    )

    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_requests"
    )

    # Optional: specific files to share
    files = models.ManyToManyField(
        File,
        blank=True,
        related_name="shared_in_requests"
    )

    # Metadata / status tracking
    message = models.TextField(
        blank=True,
        null=True,
        help_text="Optional message from the sender describing the request."
    )

    status = models.CharField(
        max_length=20,
        choices=REQUEST_STATUS_CHOICES,
        default="pending"
    )

    is_viewed = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(blank=True, null=True)

    # Utility fields
    token = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        help_text="Optional access token for secure case sharing links."
    )

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("case", "sender", "receiver")

    def __str__(self):
        return f"Request from {self.sender.username} to {self.receiver.username} for Case {self.case.case_id}"

    def mark_responded(self):
        """Helper to timestamp response time."""
        self.responded_at = timezone.now()
        self.save()