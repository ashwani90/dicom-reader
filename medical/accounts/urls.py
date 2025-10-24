from django.urls import path
from .views import RegisterView, LoginView, RefreshTokenView, LogoutView, UserView, UserListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user/', UserView.as_view(), name='user'),
    path('users/', UserListView.as_view(), name='users'),
]