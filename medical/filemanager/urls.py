from django.urls import path, include
from .views import FileUploadView, FilePreviewView, FileListView, UserViewSet, serve_file, CaseViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"cases", CaseViewSet, basename="case")
router.register(r'users', UserViewSet, basename='user')


urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('preview/<int:file_id>/', FilePreviewView.as_view(), name='file-preview'),
    path("api/files/", FileListView.as_view(), name="file-list"),
    path("api/", include(router.urls)),
    path('serve-file/<int:file_id>/', serve_file, name='serve_file'),
]
