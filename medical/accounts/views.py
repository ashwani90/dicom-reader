# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RegisterSerializer
from django.contrib.auth.models import User

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings

# helper: create tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"detail": "User created"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        # expect username & password in request.data
        from django.contrib.auth import authenticate
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            tokens = get_tokens_for_user(user)
            # set HttpOnly cookies
            res = Response({"detail": "Login successful"})
            # Configure cookie attributes appropriately
            res.set_cookie(
                key='access_token',
                value=tokens['access'],
                httponly=True,
                secure=False,        # set True in production with https
                samesite='Lax',
                max_age=60*5  # same as ACCESS_TOKEN_LIFETIME
            )
            res.set_cookie(
                key='refresh_token',
                value=tokens['refresh'],
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=60*60*24*7
            )
            return res
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class RefreshTokenView(APIView):
    # custom refresh endpoint to read refresh token from cookie
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token is None:
            return Response({"detail": "Refresh token not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(refresh_token)
            new_access = str(refresh.access_token)
            # optionally rotate refresh token
            # set new access cookie
            res = Response({"detail": "Token refreshed"})
            res.set_cookie(
                key='access_token',
                value=new_access,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=60*5
            )
            return res
        except Exception as e:
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request):
        # blacklist refresh token if blacklist app is enabled
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        res = Response({"detail": "Logged out"})
        # delete cookies
        res.delete_cookie('access_token')
        res.delete_cookie('refresh_token')
        return res

class UserView(APIView):
    
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        })


class UserListView(APIView):
    """
    API to get a list of all users.
    Only authenticated users can access.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = User.objects.all().values("id", "username", "email", "first_name", "last_name")
        return Response(users, status=status.HTTP_200_OK)