# accounts/middleware.py
class CookieToHeaderMiddleware:
    """
    If there's an access_token cookie, put Authorization header so DRF JWT auth finds it.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access = request.COOKIES.get('access_token')
        if access and 'HTTP_AUTHORIZATION' not in request.META:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access}'
        return self.get_response(request)
