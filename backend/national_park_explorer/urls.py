from django.urls import path
from .views import index, getWeather, getParks, ObtainTokenPairWithClaims, CustomUserCreate, HelloWorldView
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('', index, name='index'),
    path("getWeather/", getWeather, name="getWeather"),
    path("getParks/", getParks, name="getParks"),
    path('user/create/', CustomUserCreate.as_view(), name="create_user"),
    path('token/obtain/', ObtainTokenPairWithClaims.as_view(), name='token_create'),  
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('hello/', HelloWorldView.as_view(), name='hello_world')
]
