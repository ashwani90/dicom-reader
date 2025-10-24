import os
from typing import Tuple, Optional
import pydicom
from pydicom.uid import generate_uid
from pydicom.errors import InvalidDicomError
from filemanager.models import DicomMetadata, File

ANON_PATIENT_NAME = "ANONYMIZED"
ANON_PATIENT_ID_PREFIX = "CASE"

PHI_TAGS_TO_BLANK = [
    (0x0010, 0x0010),  # PatientName
    (0x0010, 0x0020),  # PatientID
    (0x0010, 0x0030),  # PatientBirthDate
    (0x0010, 0x0040),  # PatientSex
    (0x0008, 0x0020),  # StudyDate
    (0x0008, 0x0021),  # SeriesDate
    (0x0008, 0x0022),  # AcquisitionDate
    (0x0008, 0x0030),  # StudyTime
    (0x0008, 0x0031),  # SeriesTime
    (0x0008, 0x1030),  # StudyDescription
    (0x0008, 0x0080),  # InstitutionName
    (0x0008, 0x0090),  # ReferringPhysicianName
    (0x0010, 0x1000),  # OtherPatientIDs
    (0x0010, 0x1001),  # OtherPatientNames
    (0x0010, 0x2160),  # EthnicGroup
    (0x0010, 0x4000),  # PatientComments
    (0x0008, 0x0050),  # AccessionNumber
]

def is_dicom_file(path: str) -> bool:
    try:
        pydicom.dcmread(path, stop_before_pixels=True)
        return True
    except Exception:
        return False

def anonymize_dicom(src_path: str, dst_path: str, case_public_id: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Anonymizes a DICOM file and saves it to the destination path.
    Returns (success, modality, error_message)
    """
    print(f"Anonymizing DICOM file: {src_path} -> {dst_path}")
    try:
        if not os.path.exists(src_path):
            return False, None, f"Source file not found: {src_path}"

        # Load dataset fully (not deferred)
        ds = pydicom.dcmread(src_path, force=True)

        # Remove private tags
        ds.remove_private_tags()

        # Blank PHI fields
        for tag in PHI_TAGS_TO_BLANK:
            if tag in ds:
                ds[tag].value = ""

        # Assign anonymized values
        ds.PatientName = ANON_PATIENT_NAME
        ds.PatientID = f"{ANON_PATIENT_ID_PREFIX}_{case_public_id}"

        # Regenerate unique UIDs
        ds.StudyInstanceUID = generate_uid()
        ds.SeriesInstanceUID = generate_uid()
        ds.SOPInstanceUID = generate_uid()

        # Ensure meta info exists
        if not hasattr(ds, "file_meta") or not ds.file_meta:
            ds.file_meta = pydicom.dataset.FileMetaDataset()
        if not hasattr(ds.file_meta, "TransferSyntaxUID"):
            ds.file_meta.TransferSyntaxUID = pydicom.uid.ExplicitVRLittleEndian

        # Ensure directory exists
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)

        # Save anonymized DICOM with correct headers
        ds.is_little_endian = True
        ds.is_implicit_VR = False

        ds.save_as(dst_path, write_like_original=False)

        modality = getattr(ds, "Modality", "Unknown")
        return True, modality, None

    except Exception as e:
        return False, None, f"Error anonymizing {src_path}: {str(e)}"

def extract_dicom_metadata(dicom_path):
    """
    Extract metadata and patient details from a DICOM file.
    Returns a dictionary with both general metadata and patient information.
    """

    metadata = {
        "FilePath": dicom_path,
        "IsValid": False,
        "Patient": {},
        "Study": {},
        "Series": {},
        "Other": {}
    }

    try:
        # Read only header and metadata (skip pixel data for speed/safety)
        ds = pydicom.dcmread(dicom_path, stop_before_pixels=True)

        metadata["IsValid"] = True

        # ✅ Patient Information
        metadata["Patient"] = {
            "PatientName": str(getattr(ds, "PatientName", "")),
            "PatientID": str(getattr(ds, "PatientID", "")),
            "PatientSex": str(getattr(ds, "PatientSex", "")),
            "PatientBirthDate": str(getattr(ds, "PatientBirthDate", "")),
            "PatientAge": str(getattr(ds, "PatientAge", "")),
        }

        # ✅ Study Information
        metadata["Study"] = {
            "StudyInstanceUID": str(getattr(ds, "StudyInstanceUID", "")),
            "StudyID": str(getattr(ds, "StudyID", "")),
            "StudyDate": str(getattr(ds, "StudyDate", "")),
            "StudyTime": str(getattr(ds, "StudyTime", "")),
            "AccessionNumber": str(getattr(ds, "AccessionNumber", "")),
            "StudyDescription": str(getattr(ds, "StudyDescription", "")),
        }

        # ✅ Series Information
        metadata["Series"] = {
            "SeriesInstanceUID": str(getattr(ds, "SeriesInstanceUID", "")),
            "SeriesNumber": str(getattr(ds, "SeriesNumber", "")),
            "SeriesDescription": str(getattr(ds, "SeriesDescription", "")),
            "Modality": str(getattr(ds, "Modality", "")),
            "Manufacturer": str(getattr(ds, "Manufacturer", "")),
            "InstitutionName": str(getattr(ds, "InstitutionName", "")),
        }

        # ✅ Other useful tags
        metadata["Other"] = {
            "BodyPartExamined": str(getattr(ds, "BodyPartExamined", "")),
            "ProtocolName": str(getattr(ds, "ProtocolName", "")),
            "KVP": str(getattr(ds, "KVP", "")),
            "SliceThickness": str(getattr(ds, "SliceThickness", "")),
            "PixelSpacing": str(getattr(ds, "PixelSpacing", "")),
            "Rows": str(getattr(ds, "Rows", "")),
            "Columns": str(getattr(ds, "Columns", "")),
        }
        print(metadata)

    except InvalidDicomError:
        metadata["Error"] = "Invalid DICOM file format"
    except Exception as e:
        metadata["Error"] = f"Error reading file: {str(e)}"

    return metadata

def save_dicom_metadata(file_obj, dicom_path):
    """
    Extract metadata from a DICOM file and save it to the database.
    file_obj is an instance of your File model.
    """
    try:
        meta = extract_dicom_metadata(dicom_path)

        if not meta.get("IsValid"):
            print("Invalid DICOM file.")
            return None

        patient = meta["Patient"]
        study = meta["Study"]
        series = meta["Series"]
        other = meta["Other"]

        dicom_meta, created = DicomMetadata.objects.update_or_create(
            file=file_obj,
            defaults={
                # Patient
                "patient_name": patient.get("PatientName", ""),
                "patient_id": patient.get("PatientID", ""),
                "patient_sex": patient.get("PatientSex", ""),
                "patient_birth_date": patient.get("PatientBirthDate", ""),
                "patient_age": patient.get("PatientAge", ""),

                # Study
                "study_instance_uid": study.get("StudyInstanceUID", ""),
                "study_id": study.get("StudyID", ""),
                "study_date": study.get("StudyDate", ""),
                "study_time": study.get("StudyTime", ""),
                "accession_number": study.get("AccessionNumber", ""),
                "study_description": study.get("StudyDescription", ""),

                # Series
                "series_instance_uid": series.get("SeriesInstanceUID", ""),
                "series_number": series.get("SeriesNumber", ""),
                "series_description": series.get("SeriesDescription", ""),
                "modality": series.get("Modality", ""),
                "manufacturer": series.get("Manufacturer", ""),
                "institution_name": series.get("InstitutionName", ""),

                # Other
                "body_part_examined": other.get("BodyPartExamined", ""),
                "protocol_name": other.get("ProtocolName", ""),
                "kvp": other.get("KVP", ""),
                "slice_thickness": other.get("SliceThickness", ""),
                "pixel_spacing": other.get("PixelSpacing", ""),
                "rows": other.get("Rows", ""),
                "columns": other.get("Columns", ""),
            }
        )

        print("DICOM metadata saved:", dicom_meta)
        return dicom_meta

    except Exception as e:
        print(f"Error saving DICOM metadata: {str(e)}")
        return None