from django.urls import path
from .views import index, getWeather, getParks, user_info, favorites, ObtainTokenPairWithClaims, CustomUserCreate, LogoutAndBlacklistRefreshTokenForUserView
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('', index, name='index'),
    path("getWeather/", getWeather, name="getWeather"),
    path("getParks/", getParks, name="getParks"),
    path("user/info/", user_info, name='user_info'),
    path("user/favorites/", favorites.as_view(), name='favorites'),
    path('user/create/', CustomUserCreate.as_view(), name="create_user"),
    path('token/obtain/', ObtainTokenPairWithClaims.as_view(), name='token_create'),  
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('blacklist/', LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='blacklist')
]
