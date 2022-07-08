from django.shortcuts import render
import requests
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import filters, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, CustomUserSerializer
from rest_framework.views import APIView


# Render home page
def index(request):
    return render(request, "index.html")

# 404 Error Page
def handler404(request,exception):
    return render(request, '404.html', status=404)

# 500 Error Page
def handler500(request,exception):
    return render(request, '500.html', status=500)

# Get weather data
@api_view(['GET'])
def getWeather(request):
    lng = request.query_params.get('lng')
    lat = request.query_params.get('lat')
    weather = requests.get(f'https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lng}&exclude=&appid={settings.OPEN_WEATHER_API_KEY}').json()
    return Response(weather)

# Get park data
@api_view(['GET'])
def getParks(request):
    start = request.query_params.get('start')
    limit = request.query_params.get('limit')
    sort = request.query_params.get('sort')
    stateCode = request.query_params.get('stateCode')
    parks = requests.get(f'https://developer.nps.gov/api/v1/parks?start={start}&limit={limit}&sort={sort}&stateCode={stateCode}&api_key={settings.NPS_API_KEY}').json()
    return Response(parks)


class ObtainTokenPairWithClaims(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer


class CustomUserCreate(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format='json'):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                json = serializer.data
                return Response(json, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HelloWorldView(APIView):

    def get(self, request):
        return Response(data={"hello":"world"}, status=status.HTTP_200_OK)