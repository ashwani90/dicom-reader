import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Case, File
from .serializers import FileSerializer
from .utils.dictom_tools import is_dicom_file, anonymize_dicom
import fitz
from PIL import Image
import pytesseract
from django.http import FileResponse, Http404
from django.conf import settings

BASE_UPLOAD = "uploads"
RAW_DIR = os.path.join(BASE_UPLOAD, "raw")
ANON_DIR = os.path.join(BASE_UPLOAD, "anonymized")
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(ANON_DIR, exist_ok=True)


class FileUploadView(APIView):
    def post(self, request):
        case_id = request.data.get("case_id")
        filetype = request.data.get("filetype")
        uploaded_file = request.FILES.get("uploaded_file")

        if not all([case_id, filetype, uploaded_file]):
            return Response({"detail": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        case = get_object_or_404(Case, id=case_id)

        # Save raw file
        raw_case_dir = os.path.join(RAW_DIR, f"{case.case_id}")
        os.makedirs(raw_case_dir, exist_ok=True)
        raw_path = os.path.join(raw_case_dir, uploaded_file.name)

        with open(raw_path, "wb") as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)

        is_dcm = False
        modality = None
        anon_path = None

        # DICOM anonymization
        if is_dicom_file(raw_path):
            is_dcm = True
            anon_case_dir = os.path.join(ANON_DIR, f"{case.case_id}")
            os.makedirs(anon_case_dir, exist_ok=True)
            anon_fname = f"{case.case_id}_{uploaded_file.name}".replace(" ", "_")
            anon_path_candidate = os.path.join(anon_case_dir, anon_fname)

            ok, modality, err = anonymize_dicom(
                src_path=raw_path,
                dst_path=anon_path_candidate,
                case_public_id=case.case_id
            )
            if not ok:
                return Response({"detail": f"DICOM anonymization failed: {err}"}, status=500)
            anon_path = anon_path_candidate

        # Save record
        file_record = File.objects.create(
            case=case,
            filename=uploaded_file.name,
            filetype=filetype.upper(),
            path=raw_path,
            anonymized_path=anon_path,
            is_dicom=is_dcm,
            modality=modality
        )

        serializer = FileSerializer(file_record)
        return Response({"message": "File uploaded successfully", "file": serializer.data})


class FilePreviewView(APIView):
    def get(self, request, file_id):
        file = get_object_or_404(File, id=file_id)

        text_preview = ""
        meta = {}

        try:
            if file.is_dicom:
                from pydicom import dcmread
                dcm_path = file.anonymized_path.path if file.anonymized_path else file.path.path
                ds = dcmread(dcm_path, stop_before_pixels=True)
                meta = {
                    "Modality": str(getattr(ds, "Modality", "")),
                    "Manufacturer": str(getattr(ds, "Manufacturer", "")),
                    "StudyInstanceUID": str(getattr(ds, "StudyInstanceUID", "")),
                    "SeriesInstanceUID": str(getattr(ds, "SeriesInstanceUID", "")),
                    "SOPInstanceUID": str(getattr(ds, "SOPInstanceUID", "")),
                }
                text_preview = "DICOM file (preview shows safe, anonymized metadata)."

            elif file.filename.lower().endswith(".pdf"):
                doc = fitz.open(file.path.path)
                if doc.page_count > 0:
                    text_preview = doc[0].get_text("text")[:1000]

            elif file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
                img = Image.open(file.path.path)
                text_preview = pytesseract.image_to_string(img)[:1000]

            else:
                text_preview = "Preview not available for this file type."
        except Exception as e:
            text_preview = f"Error reading file: {str(e)}"

        serializer = FileSerializer(file)
        return Response({**serializer.data, "meta": meta, "preview": text_preview})
    
class FileListView(APIView):
    # def get(self, request):
    #     # files = File.objects.all().order_by("-uploaded_at")
    #     serializer = FileSerializer(files, many=True)
    #     return Response(serializer.data)
    
    def get(self, request):
        # Static mock data for testing
        files = File.objects.all().order_by("-uploaded_at")
        serializer = FileSerializer(files, many=True)
        return Response(serializer.data)
    
    
def serve_file(request, filename):
    """
    Serve a file from uploads folder.
    Example: /serve-file/sample.pdf
    """
    file = get_object_or_404(File, id=filename)

    # FieldFile.name already contains relative path from MEDIA_ROOT
    # e.g., "uploads/anonymized/12345/12345_abcd.DCM"
    relative_path = file.anonymized_path.name
    print(relative_path)
    relative_path = relative_path.replace("uploads/", "")
    print(relative_path)
    # Combine with MEDIA_ROOT
    file_path = os.path.join(settings.MEDIA_ROOT, relative_path)
    print(file_path)
    if not os.path.exists(file_path):
        raise Http404("File does not exist")

    # Serve file as attachment
    return FileResponse(open(file_path, "rb"), as_attachment=True)