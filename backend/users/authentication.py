"""
users/authentication.py

A custom DRF authentication class that reads the JWT access token
from an HttpOnly cookie instead of the Authorization header.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed


class CookieJWTAuthentication(JWTAuthentication):
    """
    Extends SimpleJWT's default authenticator to look for the access token
    in the `access_token` cookie rather than the `Authorization: Bearer …` header.
    Falls back to the header if the cookie is absent (useful for tools like Postman).
    """

    def authenticate(self, request):
        # Try cookie first
        raw_token = request.COOKIES.get('access_token')

        if raw_token is None:
            # Fall back to standard Authorization header
            return super().authenticate(request)

        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken as exc:
            raise AuthenticationFailed(str(exc))

        return self.get_user(validated_token), validated_token
