from django.urls import path
from .views import FileUploadView, FilePreviewView, FileListView, serve_file

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('preview/<int:file_id>/', FilePreviewView.as_view(), name='file-preview'),
    path("api/files/", FileListView.as_view(), name="file-list"),
    path('serve-file/<str:filename>/', serve_file, name='serve_file'),
]
