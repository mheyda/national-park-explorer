from django.shortcuts import render
import requests
import json
import gpxpy
import geojson
from django.utils import timezone
from fitparse import FitFile
from django.db import transaction
from django.core.paginator import Paginator
from django.core.cache import cache
from django.conf import settings
from django.http import JsonResponse, StreamingHttpResponse
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import filters, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, CustomUserSerializer, ParkSerializer, FileUploadSerializer
from .models import CustomUser, Favorite, Visited, Park, Park_Data, TextChunk, UploadedFile, Gpx_Activity, Record
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from sentence_transformers import SentenceTransformer
from django.db.models.expressions import RawSQL
from collections import defaultdict
import os
import logging
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
LLM_SERVER_URL = "http://18.223.121.77:5000/infer"  # LLM server endpoint
MAX_QUESTION_LENGTH = 1000
INTENT_TO_CHUNK_TYPES = {
    "activities": ["activities", "description", "topics"],
    "weather": ["weather"],
    "directions": ["directions"],
    "fees": ["fees"],
    "contact": ["contact"],
    "campground": ["description", "directions", "amenities", "accessibility"],
    "general": ["description", "topics"],
}

# Render home page
def index(request):
    return render(request, "index.html")


# 404 Error Page
def handler404(request, exception):
    return render(request, '404.html', status=404)


# 500 Error Page
def handler500(request, exception):
    return render(request, '500.html', status=500)


# AI Chatbot
def get_park_code_from_question(question):
    q = question.lower()
    for park in Park_Data.objects.all():
        if park.full_name and park.full_name.lower() in q:
            return park.park_code
        if park.name and park.name.lower() in q:
            return park.park_code
    return None

def rank_chunks_by_intent(chunks, intent):
    preferred_types = INTENT_TO_CHUNK_TYPES.get(intent, ["description", "topics"])

    def score(chunk):
        # Lower score is better
        type_score = 0 if chunk.chunk_type in preferred_types else 1
        return (type_score, getattr(chunk, 'similarity', 1.0))

    return sorted(chunks, key=score)

def get_top_chunks(query_embedding, k=20, park_code=None):
    query_embedding_str = "[" + ",".join(f"{x:.6f}" for x in query_embedding) + "]"
    queryset = TextChunk.objects.all()

    if park_code:
        park = Park_Data.objects.filter(park_code=park_code).first()
        if park:
            park_uuid_tag = f"park_uuid:{park.uuid}"
            queryset = queryset.filter(relevance_tags__contains=[park_uuid_tag])

    return (
        queryset.annotate(
            similarity=RawSQL("embedding <#> %s", (query_embedding_str,))
        )
        .order_by("similarity")[:k]
    )

def build_chat_messages(query, chunks):
    context_lines = []

    for i, chunk in enumerate(chunks, start=1):
        label = f"{chunk.source_type.upper()} - {chunk.chunk_type or 'general'}"
        content = chunk.chunk_text.strip().replace("\n", " ")
        context_lines.append(f"{i}. [{label}]: {content}")

    context = "\n".join(context_lines)

    system_prompt = (
        "You are a helpful US park ranger answering questions about US National Parks, "
        "Monuments, Historical Sites, and other sites in the National Park System. "
        "Use the numbered context information to answer the user's question clearly and accurately."
    )

    user_prompt = f"Context:\n{context}\n\nQuestion:\n{query}"

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]


def limit_chunks_per_source(chunks, max_per_source=2, k=10):
    limited = []
    seen = defaultdict(int)

    for chunk in chunks:
        if seen[chunk.source_uuid] < max_per_source:
            limited.append(chunk)
            seen[chunk.source_uuid] += 1
        if len(limited) >= k:
            break
    return limited

def infer_intent_from_query(query):
    q = query.lower()

    if any(word in q for word in ["do", "things to do", "activities", "hiking", "explore"]):
        return "activities"
    elif "weather" in q:
        return "weather"
    elif "directions" in q or "how do i get" in q or "how to get" in q:
        return "directions"
    elif "fee" in q or "pass" in q or "cost" in q or "entrance" in q:
        return "fees"
    elif "contact" in q or "phone" in q or "email" in q:
        return "contact"
    elif "camp" in q or "campground" in q or "rv" in q or "tent" in q:
        return "campground"
    else:
        return "general"

@api_view(['POST'])
def ask_question(request):
    user_question = request.data.get("question", "")
    user_question = user_question[:MAX_QUESTION_LENGTH].strip()
    debug = request.data.get("debug", False)

    if not user_question:
        return Response({"error": "Missing 'question' in request."}, status=400)

    try:
        query_embedding = embedding_model.encode(user_question).tolist()
        source_type = request.data.get("source_type")

        # Determine user intent and park
        intent = infer_intent_from_query(user_question)
        park_code = get_park_code_from_question(user_question)

        # Step 1: Get top chunks scoped to the correct park
        chunks = get_top_chunks(query_embedding, k=5, park_code=park_code)

        # Optional: filter out useless types
        if intent not in ["contact", "fees", "directions"]:
            chunks = [c for c in chunks if c.chunk_type not in ["contact", "fees", "directions", "metadata"]]

        # Step 2: Limit per source
        chunks = limit_chunks_per_source(chunks, max_per_source=2, k=5)

        # Step 3: Build prompt
        chat_messages = build_chat_messages(user_question, chunks)

        if debug:
            return Response({
                "question": user_question,
                "intent": intent,
                "matched_park_code": park_code,
                "retrieved_chunks": [
                    {
                        "chunk_index": chunk.chunk_index,
                        "source_type": chunk.source_type,
                        "chunk_type": chunk.chunk_type,
                        "source_uuid": str(chunk.source_uuid),
                        "chunk_text": chunk.chunk_text[:1000] + ("..." if len(chunk.chunk_text) > 1000 else ""),
                        "similarity": getattr(chunk, "similarity", None)
                    }
                    for chunk in chunks
                ],
                "chat_messages": chat_messages
            })

        # Step 5: Call LLM
        try:
            llm_response = requests.post(
                LLM_SERVER_URL,
                json={"messages": chat_messages},
                stream=True,
                timeout=300
            )
            llm_response.raise_for_status()

            def stream_llm():
                for chunk in llm_response.iter_content(chunk_size=1024):
                    if chunk:
                        yield chunk

            return StreamingHttpResponse(stream_llm(), content_type="text/plain")

        except requests.RequestException as e:
            logger.error(f"LLM server request failed: {e}")
            return Response({"error": "LLM server is unavailable."}, status=502)


    except Exception as e:
        logger.exception("Error in ask_question")
        return Response({"error": str(e)}, status=500)


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
    start = int(request.query_params.get('start', 0))
    limit = int(request.query_params.get('limit', 50))

    parks = Park.objects.all().order_by('fullName')
    paginator = Paginator(parks, limit)

    page_number = (start // limit) + 1
    page = paginator.get_page(page_number)

    serializer = ParkSerializer(page.object_list, many=True, context={'request': request})

    return Response({
        'total': str(parks.count()),
        'data': serializer.data,
        'limit': str(limit),
        'start': str(start)
    })


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

# API view for user to get and post requests for their visited parks
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def visited(request):
    
    if request.method == 'GET':
        try:
            user = CustomUser.objects.get(username=request.user)
            visited_list = Visited.objects.filter(user=user).values_list('park_id', flat=True)
            return Response(visited_list, status=status.HTTP_200_OK)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        try:
            park_id = request.data
            if not park_id:
                raise ValueError('Data must not be empty.')
                
            user = CustomUser.objects.get(username=request.user)
            visited_list = Visited.objects.filter(user=user).values_list('park_id', flat=True)

            # Toggle off if already visited
            if park_id in visited_list:
                Visited.objects.filter(user=user, park_id=park_id).delete()
                visited_list = Visited.objects.filter(user=user).values_list('park_id', flat=True)
                return Response(visited_list, status=status.HTTP_200_OK)

            # Add new visited park
            Visited.objects.create(user=user, park_id=park_id)
            visited_list = Visited.objects.filter(user=user).values_list('park_id', flat=True)
            return Response(visited_list, status=status.HTTP_200_OK)

        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class ObtainTokenPairWithClaims(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer


class LogoutAndBlacklistRefreshTokenForUserView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    parser_classes = [JSONParser]

    def post(self, request):
        try:
            print("Type of request.data:", type(request.data))
            print("request.data =", request.data)
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)

            if not refresh_token:
                return Response({'detail': 'Refresh token not provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            logger.exception("Logout/blacklist failed")
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
    

def get_local_tag(tag):
    if '}' in tag:
        return tag.split('}', 1)[1]
    return tag


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser]) 
def upload_file(request):
    logger.info("Upload endpoint called.")

    # Only allow myself for right now
    if (request.user.username != "mheyda"):
        return Response({'message': 'Sorry, this functionality is not yet available to you.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    upload_status = {}
    uploaded_files = request.FILES.getlist('files')  # 'files' is the key in FormData
    for uploaded_file in uploaded_files:
        filename = uploaded_file.name

        serializer = FileUploadSerializer(data={
            'file': uploaded_file,
            'original_filename': filename,
        })
            
        if serializer.is_valid():
            logger.info(f"Received file: {filename}")

            # Check if file already exists
            if UploadedFile.objects.filter(user=request.user, original_filename=filename).exists():
                upload_status[filename] = f'File already exists in database.'
                continue
                # return Response({'message': f'File {request.data["file"].name} already exists in database.'}, status=status.HTTP_409_CONFLICT)
                    
            # Check file extension
            ALLOWED_EXTENSIONS = {'.fit', '.FIT', '.gpx', '.GPX'}
            file_extension = os.path.splitext(filename)[-1].lower()
            logger.info(f"File extension: {file_extension}")
            if file_extension not in ALLOWED_EXTENSIONS:
                upload_status[filename] = f'Invalid file type'
                continue
                # return Response({'message': 'Invalid file type.'}, status=status.HTTP_400_BAD_REQUEST)

            # Check file size
            MAX_UPLOAD_SIZE_MB = 50
            MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024
            logger.info(f"File size: {uploaded_file.size} bytes")
            if uploaded_file.size > MAX_UPLOAD_SIZE:
                upload_status[filename] = f'{MAX_UPLOAD_SIZE_MB}MB limit exceeded.'
                continue
                # return Response({'message': f'File exceeds {MAX_UPLOAD_SIZE_MB}MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

            GPX_EXTENSIONS = {'.gpx', '.GPX'}
            FIT_EXTENSIONS = {'.fit', '.FIT'}
            if file_extension.lower() in FIT_EXTENSIONS:
                with transaction.atomic():
                    saved_file = serializer.save(user=request.user, file=uploaded_file, original_filename=filename, file_type=file_extension)
                    
                    try:
                        fit = FitFile(saved_file.file.path)
                        fit.parse()
                        logger.info(f"Starting to read {filename}")
                        
                        # Initialize fallback stats
                        activity_name = None
                        session_data = None
                        records_to_create = []
                        coords = []
                        first_timestamp = None
                        last_timestamp = None
                        moving_seconds = 0
                        max_speed = 0
                        sum_hr = 0
                        count_hr = 0
                        sum_cadence = 0
                        count_cadence = 0
                        ascent = 0
                        descent = 0
                        prev_altitude = None
                        last_distance = 0
                        bounds = {
                            'min_lat': float('inf'),
                            'max_lat': float('-inf'),
                            'min_lon': float('inf'),
                            'max_lon': float('-inf'),
                        }
                        
                        sport_int = None  # to store sport code
                        
                        for msg in fit.get_messages():
                            if msg.name == 'session':
                                session_data = {d.name: d.value for d in msg}
                                sport_int = session_data.get('sport')
                                logger.info(f"Session message found with sport: {sport_int}")
                                if not activity_name:
                                    for d in msg:
                                        if d.name == 'name' and d.value:
                                            activity_name = d.value
                                continue

                            if msg.name == 'activity':
                                if not activity_name:
                                    for d in msg:
                                        if d.name == 'name' and d.value:
                                            activity_name = d.value
                                continue

                            if msg.name != 'record':
                                continue

                            data = {d.name: d.value for d in msg}
                            ts = data.get('timestamp')
                            if ts and timezone.is_naive(ts):
                                ts = timezone.make_aware(ts)
                            lat_raw = data.get('position_lat')
                            lon_raw = data.get('position_long')
                            lat = lat_raw * (180 / 2**31) if lat_raw is not None else None
                            lon = lon_raw * (180 / 2**31) if lon_raw is not None else None
                            speed = data.get('enhanced_speed')
                            altitude = data.get('enhanced_altitude')
                            distance = data.get('distance')
                            heart_rate = data.get('heart_rate')
                            cadence = data.get('cadence')
                            temperature = data.get('temperature')

                            if lat is not None and lon is not None:
                                coords.append([lat, lon])
                                bounds['min_lat'] = min(bounds['min_lat'], lat)
                                bounds['max_lat'] = max(bounds['max_lat'], lat)
                                bounds['min_lon'] = min(bounds['min_lon'], lon)
                                bounds['max_lon'] = max(bounds['max_lon'], lon)

                            if ts:
                                if not first_timestamp:
                                    first_timestamp = ts
                                last_timestamp = ts

                            if speed and speed > 0.5:
                                moving_seconds += 1
                            if speed:
                                max_speed = max(max_speed, speed)

                            if altitude is not None and prev_altitude is not None:
                                delta = altitude - prev_altitude
                                if delta > 0:
                                    ascent += delta
                                else:
                                    descent += -delta
                            prev_altitude = altitude

                            if heart_rate:
                                sum_hr += heart_rate
                                count_hr += 1

                            if cadence:
                                sum_cadence += cadence
                                count_cadence += 1

                            if distance:
                                last_distance = max(last_distance, distance)

                            records_to_create.append(Record(
                                activity=None, # Set later
                                timestamp=ts,
                                position_lat=lat,
                                position_long=lon,
                                altitude=altitude,
                                heart_rate=heart_rate,
                                cadence=cadence,
                                speed=speed,
                                distance=distance,
                                temperature=temperature
                            ))

                        if not session_data:
                            logger.info("Session data missing, using fallback.")
                            total_elapsed_time = (last_timestamp - first_timestamp).total_seconds() if first_timestamp and last_timestamp else 0
                            session_data = {
                                'total_distance': last_distance,
                                'total_timer_time': total_elapsed_time,
                                'total_elapsed_time': total_elapsed_time,
                                'total_moving_time': moving_seconds,
                                'max_speed': max_speed,
                                'total_ascent': ascent,
                                'total_descent': descent,
                                'total_calories': None,
                                'avg_heart_rate': int(sum_hr / count_hr) if count_hr else None,
                                'avg_cadence': int(sum_cadence / count_cadence) if count_cadence else None,
                            }

                        if not first_timestamp or not last_timestamp:
                            raise ValueError("No valid timestamps found in FIT file.")

                        geojson_obj = None
                        if coords:
                            geojson_obj = {
                                "type": "FeatureCollection",
                                "features": [{
                                    "type": "Feature",
                                    "geometry": {
                                        "type": "LineString",
                                        "coordinates": coords
                                    }
                                }]
                            }

                        sport_name = str(sport_int).lower() if sport_int else ''
                        
                        if not activity_name:
                            activity_name = filename.rsplit('.', 1)[0]

                        activity = Gpx_Activity.objects.create(
                            user=request.user,
                            name=activity_name,
                            sport=sport_name,
                            bounds=bounds,
                            start_time=first_timestamp,
                            total_elapsed_time=session_data.get('total_elapsed_time'),
                            total_distance=session_data.get('total_distance'),
                            total_calories=session_data.get('total_calories'),
                            total_ascent=session_data.get('total_ascent'),
                            total_descent=session_data.get('total_descent'),
                            avg_heart_rate=session_data.get('avg_heart_rate'),
                            avg_cadence=session_data.get('avg_cadence'),
                            geojson=geojson_obj
                        )

                        if not records_to_create:
                            raise ValueError("No valid record messages found in FIT file.")
                        for record in records_to_create:
                            record.activity = activity

                        Record.objects.bulk_create(records_to_create)

                        saved_file.activity = activity
                        saved_file.processing_status = 'parsed'
                        saved_file.save()

                        logger.info(f"Activity saved")
                        upload_status[filename] = f'Uploaded successfully.'
                        continue
                        # return Response({'message': 'Uploaded ' + filename + ' successfully.'}, status=status.HTTP_201_CREATED)

                    except Exception as e:
                        logger.error(f"Error parsing FIT file: {str(e)}")
                        upload_status[filename] = f'Failed to parse file: {str(e)}'
                        continue
                        # return Response({'message': f'Failed to parse FIT file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            
            
            # For .gpx files
            elif file_extension.lower() in GPX_EXTENSIONS:
                with transaction.atomic():
                    user_uploaded_file = serializer.save(user=request.user, file=uploaded_file, original_filename=filename, file_type=file_extension)

                    try:
                        with open(user_uploaded_file.file.path, 'r', encoding='utf-8') as f:
                            gpx = gpxpy.parse(f)

                        features = []
                        records_to_create = []
                        distance = 0
                        total_elapsed_time = 0
                        max_speed = 0
                        ascent = 0
                        descent = 0
                        calories = 0
                        avg_heart_rate = None
                        avg_cadence = None
                        first_timestamp = None
                        last_timestamp = None
                        bounds = {
                            'min_lat': float('inf'),
                            'max_lat': float('-inf'),
                            'min_lon': float('inf'),
                            'max_lon': float('-inf'),
                        }

                        for track in gpx.tracks:
                            for segment in track.segments:
                                coords = []
                                times = []

                                for point in segment.points:
                                    lat = point.latitude
                                    lon = point.longitude
                                    ele = point.elevation
                                    ts = point.time

                                    if lat is None or lon is None:
                                        continue

                                    bounds['min_lat'] = min(bounds['min_lat'], lat)
                                    bounds['max_lat'] = max(bounds['max_lat'], lat)
                                    bounds['min_lon'] = min(bounds['min_lon'], lon)
                                    bounds['max_lon'] = max(bounds['max_lon'], lon)

                                    coords.append([lat, lon])
                                    times.append(ts.isoformat() if ts else None)

                                    if ts:
                                        if not first_timestamp:
                                            first_timestamp = ts
                                        last_timestamp = ts

                                    # Default to None
                                    heart_rate = None
                                    cadence = None
                                    temperature = None

                                    # Parse extensions
                                    if point.extensions:
                                        for ext in point.extensions:
                                            for child in ext:
                                                tag = get_local_tag(child.tag)
                                                if tag == 'TrackPointExtension':
                                                    for sub in child:
                                                        sub_tag = get_local_tag(sub.tag)
                                                        if sub_tag == 'hr':
                                                            heart_rate = int(sub.text)
                                                        elif sub_tag == 'cad':
                                                            cadence = int(sub.text)
                                                        elif sub_tag == 'atemp':
                                                            temperature = int(sub.text)
                                                elif tag == 'Temperature':
                                                    try:
                                                        temperature = int(child.text)
                                                    except (TypeError, ValueError):
                                                        pass

                                    records_to_create.append(Record(
                                        activity=None,
                                        timestamp=ts,
                                        position_lat=lat,
                                        position_long=lon,
                                        altitude=ele,
                                        heart_rate=heart_rate,
                                        cadence=cadence,
                                        speed=None,
                                        distance=None,
                                        temperature=temperature
                                    ))

                                line = geojson.LineString(coords)
                                features.append(geojson.Feature(geometry=line, properties={"times": times}))

                            # Try to parse Garmin extensions if available
                            for ext in track.extensions:
                                ext_xml = ET.tostring(ext, encoding='unicode')
                                ext_element = ET.fromstring(ext_xml)

                                if ext_element.tag == '{http://www.garmin.com/xmlschemas/TrackStatsExtension/v1}TrackStatsExtension':
                                    def parse_float(key):
                                        val = ext_element.findtext(f'{{http://www.garmin.com/xmlschemas/TrackStatsExtension/v1}}{key}')
                                        return float(val) if val else None

                                    def parse_int(key):
                                        val = ext_element.findtext(f'{{http://www.garmin.com/xmlschemas/TrackStatsExtension/v1}}{key}')
                                        return int(float(val)) if val else None

                                    distance = parse_float('Distance')
                                    total_elapsed_time = parse_int('TotalElapsedTime')
                                    max_speed = parse_float('MaxSpeed')
                                    ascent = parse_float('Ascent')
                                    descent = parse_float('Descent')
                                    calories = parse_int('Calories')
                                    avg_heart_rate = parse_int('AvgHeartRate')
                                    avg_cadence = parse_int('AvgCadence')

                        if not first_timestamp or not last_timestamp:
                            raise ValueError("No valid timestamps found in GPX file.")

                        geojson_obj = geojson.FeatureCollection(features)

                        if not records_to_create:
                            raise ValueError("No track points found in GPX file.")
                        
                        activity_name = None
                        if gpx.name:
                            activity_name = gpx.name.strip() # gpx.name (GPX root name)
                        elif gpx.tracks and len(gpx.tracks) > 0 and gpx.tracks[0].name:
                            activity_name = gpx.tracks[0].name.strip() # If no gpx.name, try first track name
                        else:
                            activity_name = filename.rsplit('.', 1)[0] # Fallback to filename without extension

                        activity = Gpx_Activity.objects.create(
                            user=request.user,
                            name=activity_name,
                            sport='',
                            bounds={
                                'min_lat': bounds['min_lat'],
                                'max_lat': bounds['max_lat'],
                                'min_lon': bounds['min_lon'],
                                'max_lon': bounds['max_lon'],
                            },
                            start_time=first_timestamp,
                            total_elapsed_time=total_elapsed_time or (last_timestamp - first_timestamp).total_seconds(),
                            total_distance=distance,
                            total_calories=calories,
                            total_ascent=ascent,
                            total_descent=descent,
                            avg_heart_rate=avg_heart_rate,
                            avg_cadence=avg_cadence,
                            geojson=json.loads(geojson.dumps(geojson_obj))
                        )

                        for record in records_to_create:
                            record.activity = activity

                        Record.objects.bulk_create(records_to_create)

                        user_uploaded_file.activity = activity
                        user_uploaded_file.processing_status = 'parsed'
                        user_uploaded_file.save()

                        logger.info(f"GPX activity saved.")
                        upload_status[filename] = f'Uploaded successfully.'
                        continue
                        # return Response({'message': f'Uploaded {filename} successfully.'}, status=status.HTTP_201_CREATED)

                    except Exception as e:
                        logger.error(f"Error parsing GPX file: {str(e)}")
                        upload_status[filename] = f'Failed to parse file: {str(e)}'
                        continue
                        # return Response({'message': f'Failed to parse GPX: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            upload_status[filename] = f'{str(serializer.errors["file"][0])}'
            continue
    
    return Response({'message': upload_status}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_file_stats(request):
    
    # Only allow myself for right now
    if (request.user.username != "mheyda"):
        return Response({'message': 'Sorry, this functionality is not yet available to you.'}, status=status.HTTP_401_UNAUTHORIZED)

    files_list = UploadedFile.objects.filter(user = request.user, processing_status = 'parsed')

    file_stats = []
    for file in files_list:
        file_stats.append({
            'filename': file.original_filename,
            'bounds': file.activity.bounds,
            'sport': file.activity.sport,
            'total_distance': file.activity.total_distance,
            'total_calories': file.activity.total_calories,
            'start_time': file.activity.start_time,
            'total_elapsed_time': file.activity.total_elapsed_time,
            'total_ascent': file.activity.total_ascent,
            'total_descent': file.activity.total_descent,
            'avg_heart_rate': file.activity.avg_heart_rate,
            'avg_cadence': file.activity.avg_cadence,
        })
        
    return JsonResponse(file_stats, safe=False, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_geojson(request, filename):

    # Only allow myself for right now
    if (request.user.username != "mheyda"):
        return Response({'message': 'Sorry, this functionality is not yet available to you.'}, status=status.HTTP_401_UNAUTHORIZED)

    # Try cache first
    cache_key = f"get_{request.user.id}_{filename}"
    cached_data = cache.get(cache_key)

    if cached_data:
        print("Using cache for", filename)
        return JsonResponse(cached_data, status=status.HTTP_200_OK)

    try:
        # Get geojson from database
        file = UploadedFile.objects.select_related('activity').get(original_filename=filename)
        geojson = file.activity.geojson if file.activity else None
    except UploadedFile.DoesNotExist:
        return JsonResponse({'message': f'Filename {filename} not found for user {request.user.username}'}, status=status.HTTP_404_NOT_FOUND)
    
    cache.set(cache_key, geojson, timeout=86400) # Cache for 24 hrs

    return JsonResponse(geojson, status=status.HTTP_200_OK)