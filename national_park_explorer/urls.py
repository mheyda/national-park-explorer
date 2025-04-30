from django.urls import path
from .views import index, getWeather, getParks, user_info, favorites, upload_gpx, get_gpx_filenames, get_gpx, ObtainTokenPairWithClaims, CustomUserCreate, LogoutAndBlacklistRefreshTokenForUserView
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('', index, name='index'),
    path("getWeather/", getWeather, name="getWeather"),
    path("getParks/", getParks, name="getParks"),
    path("user/info/", user_info, name='user_info'),
    path("user/favorites/", favorites, name='favorites'),
    path("user/gpx/upload/", upload_gpx, name='upload_gpx'),
    path("user/gpx/getNames/", get_gpx_filenames, name='get_gpx_filenames'),
    path("user/gpx/getFile/<str:filename>/", get_gpx, name='get_gpx'),
    path('user/create/', CustomUserCreate.as_view(), name="create_user"),
    path('token/obtain/', ObtainTokenPairWithClaims.as_view(), name='token_create'),  
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('blacklist/', LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='blacklist')
]
