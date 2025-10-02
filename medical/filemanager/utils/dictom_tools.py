import os
from typing import Tuple, Optional
import pydicom
from pydicom.uid import generate_uid

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

def anonymize_dicom(
    src_path: str,
    dst_path: str,
    case_public_id: str
) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Returns (success, modality, error_message)
    """
    try:
        ds = pydicom.dcmread(src_path)
        # Remove private tags + curves
        ds.remove_private_tags()

        # Blank common PHI fields
        for tag in PHI_TAGS_TO_BLANK:
            if tag in ds:
                ds[tag].value = ""

        # Set safe patient fields
        ds.PatientName = ANON_PATIENT_NAME
        ds.PatientID = f"{ANON_PATIENT_ID_PREFIX}_{case_public_id}"

        # Regenerate UIDs for Study/Series/SOP (de-link from source)
        if "StudyInstanceUID" in ds:
            ds.StudyInstanceUID = generate_uid()
        if "SeriesInstanceUID" in ds:
            ds.SeriesInstanceUID = generate_uid()
        if "SOPInstanceUID" in ds:
            ds.SOPInstanceUID = generate_uid()

        # Save anonymized
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        ds.save_as(dst_path)

        modality = str(getattr(ds, "Modality", "") or "")
        return True, modality, None
    except Exception as e:
        return False, None, str(e)
