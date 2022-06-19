from django.shortcuts import render
import requests
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Create your views here.
# Render home page
def index(request):
    return render(request, "index.html")

def handler404(request,exception):
    return render(request, '404.html', status=404)

def handler500(request,exception):
    return render(request, '500.html', status=500)

@api_view(['GET'])
def getWeather(request):
    if request.method == 'GET':
        lng = request.query_params.get('lng')
        lat = request.query_params.get('lat')
        weather = requests.get(f'https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lng}&exclude=&appid={settings.OPEN_WEATHER_API_KEY}').json()
        return Response(weather)

@api_view(['GET'])
def getParks(request):
    if request.method == 'GET':
        start = request.query_params.get('start')
        limit = request.query_params.get('limit')
        sort = request.query_params.get('sort')
        stateCode = request.query_params.get('stateCode')
        parks = requests.get(f'https://developer.nps.gov/api/v1/parks?start={start}&limit={limit}&sort={sort}&stateCode={stateCode}&api_key={settings.NPS_API_KEY}').json()
        return Response(parks)
