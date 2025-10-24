from django.urls import path, include
from .views import CaseRequestActionView, FileSendView, FileUploadView, FilePreviewView, FileListView, UserViewSet, serve_file, CaseViewSet, CaseRequestListView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"cases", CaseViewSet, basename="case")
router.register(r'users', UserViewSet, basename='user')


urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('preview/<int:file_id>/', FilePreviewView.as_view(), name='file-preview'),
    path("api/files/", FileListView.as_view(), name="file-list"),
    path("api/", include(router.urls)),
    path("api/files/send/", FileSendView.as_view(), name="file-send"),
    path("api/case-requests/", CaseRequestListView.as_view(), name="case-request-list"),
    path('serve-file/<int:file_id>/', serve_file, name='serve_file'),
    path("api/case-requests/<int:pk>/action/", CaseRequestActionView.as_view(), name="case-request-action"),
]
