from django.urls import path, include
from .views import FileUploadView, FilePreviewView, FileListView, serve_file
from rest_framework.routers import DefaultRouter
from .views import CaseViewSet

router = DefaultRouter()
router.register(r"cases", CaseViewSet, basename="case")


urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('preview/<int:file_id>/', FilePreviewView.as_view(), name='file-preview'),
    path("api/files/", FileListView.as_view(), name="file-list"),
    path("api/", include(router.urls)),
    path('serve-file/<str:filename>/', serve_file, name='serve_file'),
]
