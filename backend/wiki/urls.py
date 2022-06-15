
from django.contrib import admin
from django.urls import include, path
from api.views import index, getWeather, getParks

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index, name='index'),
    path("getWeather/", getWeather, name="getWeather"),
    path("getParks/", getParks, name="getParks"),
]