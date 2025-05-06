from django.shortcuts import render
import requests
import json
import gpxpy
import geojson
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import filters, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, CustomUserSerializer, FileUploadSerializer
from .models import CustomUser, Favorite, GpxFile
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import os



# Render home page
def index(request):
    return render(request, "index.html")


# 404 Error Page
def handler404(request, exception):
    return render(request, '404.html', status=404)


# 500 Error Page
def handler500(request, exception):
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


# Get user information
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_info(request):
    
    if request.method == 'GET':
        try:
            user_info = {
                "username": request.user.username,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "birthdate": request.user.birthdate,
            }
            return Response(user_info, status=status.HTTP_200_OK)

        except:
            return Response(status=status)
    if request.method == 'PUT':
        try:
            new_info = request.data
            user = CustomUser.objects.get(username = request.user)

            for key, value in new_info.items():
                setattr(user, key, value)
            user.save()

            user_info = {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "birthdate": user.birthdate,
            }

            return Response(user_info, status=status.HTTP_200_OK)
        except:
            return Response(status=status)


# API view for user to get and post requests for their favorite parks
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def favorites(request):
    
    if request.method == 'GET':
        try:
            # Find user's favorites and return them
            user = CustomUser.objects.get(username = request.user)
            favorites_list = Favorite.objects.filter(user = user).values_list('park_id', flat=True)
            return Response(favorites_list, status=status.HTTP_200_OK)

        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        try:
            # Get the id of the park the user wants to add or remove, get user object, and get user's favorites
            park_id = request.data
            if not park_id:
                raise ValueError('Data must not be empty.')
                
            user = CustomUser.objects.get(username = request.user)
            favorites_list = Favorite.objects.filter(user = user).values_list('park_id', flat=True)

            # If the user already has the park in their favorites, remove it
            for favorite in favorites_list:
                if favorite == park_id:
                    Favorite.objects.filter(user = user, park_id = park_id).delete()
                    favorites_list = Favorite.objects.filter(user = user).values_list('park_id', flat=True)
                    return Response(favorites_list, status=status.HTTP_200_OK)
            
            # Otherwise add to user's favorites
            Favorite.objects.create(user = user, park_id = park_id)
            favorites_list = Favorite.objects.filter(user = user).values_list('park_id', flat=True)
            return Response(favorites_list, status=status.HTTP_200_OK)

        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class ObtainTokenPairWithClaims(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer


class LogoutAndBlacklistRefreshTokenForUserView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


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
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser]) 
def upload_gpx(request):
    
    # Only allow myself for right now
    if (request.user.username != "mheyda"):
        return Response({'message': 'Sorry, this functionality is not yet available to you.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializer = FileUploadSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, file=request.data['file'], original_filename=request.data['file'].name)
        return Response({'message': 'Uploaded ' + request.data['file'].name + ' successfully.'}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_gpx_filenames(request):
    
    # Only allow myself for right now
    if (request.user.username != "mheyda"):
        return Response({'message': 'Sorry, this functionality is not yet available to you.'}, status=status.HTTP_401_UNAUTHORIZED)

    user = CustomUser.objects.get(username = request.user)
    filename_list = GpxFile.objects.filter(user = user).values_list('original_filename', flat=True)
    files_list = GpxFile.objects.filter(user = user)

    file_dict = {key: [[0, 0], [0, 0]] for key in filename_list}

    for gpx_file in files_list:
        with open(gpx_file.file.path, 'r', encoding='utf-8') as file:
            gpx = gpxpy.parse(file)
        
        # Initialize bounds
        min_lat = float('inf')
        max_lat = float('-inf')
        min_lon = float('inf')
        max_lon = float('-inf')

        # Iterate through all the track segments and points to find the bounds
        for track in gpx.tracks:
            for segment in track.segments:
                for point in segment.points:
                    lat, lon = point.latitude, point.longitude
                    min_lat = min(min_lat, lat)
                    max_lat = max(max_lat, lat)
                    min_lon = min(min_lon, lon)
                    max_lon = max(max_lon, lon)

        file_dict[gpx_file.original_filename] = [[min_lat, min_lon], [max_lat, max_lon]]

    return JsonResponse(file_dict, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_gpx(request, filename):
    
    # Only allow myself for right now
    if (request.user.username != "mheyda"):
        return Response({'message': 'Sorry, this functionality is not yet available to you.'}, status=status.HTTP_401_UNAUTHORIZED)

    user = CustomUser.objects.get(username = request.user)
    file_obj = GpxFile.objects.filter(user = user, original_filename = filename).first()

    with open(file_obj.file.path, 'r', encoding='utf-8') as gpx_file:
        gpx = gpxpy.parse(gpx_file)

    features = []

    for track in gpx.tracks:
        for segment in track.segments:
            coords = []
            times = []

            for point in segment.points:
                coords.append([
                    point.latitude,
                    point.longitude,
                    # point.elevation if point.elevation is not None else 0
                ])
                times.append(point.time.isoformat() if point.time else None)

            line = geojson.LineString(coords)
            feature = geojson.Feature(
                geometry=line,
                properties={"times": times}
            )
            features.append(feature)

    geojson_obj = geojson.FeatureCollection(features)
    return JsonResponse(geojson_obj)