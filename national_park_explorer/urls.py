from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import index, getWeather, getParks, user_info, favorites, visited, upload_file, get_file_stats, get_geojson, ObtainTokenPairWithClaims, CustomUserCreate, LogoutAndBlacklistRefreshTokenForUserView
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('', index, name='index'),
    path("getWeather/", getWeather, name="getWeather"),
    path("getParks/", getParks, name="getParks"),
    path("user/info/", user_info, name='user_info'),
    path("user/favorites/", favorites, name='favorites'),
    path('user/visited/', visited, name='visited'),
    path("user/file/upload/", upload_file, name='upload_file'),
    path("user/file/getAllStats/", get_file_stats, name='get_file_stats'),
    path("user/file/getGeoJson/<str:filename>/", get_geojson, name='get_geojson'),
    path('user/create/', CustomUserCreate.as_view(), name="create_user"),
    path('token/obtain/', ObtainTokenPairWithClaims.as_view(), name='token_create'),  
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('blacklist/', LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='blacklist')
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
