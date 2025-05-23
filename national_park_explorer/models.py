import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator


# User data
class CustomUser(AbstractUser):
    first_name = models.CharField(blank=True, max_length=120)
    last_name = models.CharField(blank=True, max_length=120)
    birthdate = models.CharField(blank=True, max_length=120)

# Favorites
class Favorite(models.Model):
    park_id = models.CharField(blank=True, max_length=120)
    user = models.ForeignKey(CustomUser, on_delete = models.CASCADE, default = None)

# User uploaded files
def generate_filepath(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    return f"files/users/{instance.user.username}/{new_filename}"

class UploadedFile(models.Model):
    FILE_TYPE_CHOICES = (
        ('.fit', '.FIT'),
        ('.gpx', '.GPX'),
    )

    PROCESSING_STATUS = (
        ('pending', 'Pending'),
        ('parsed', 'Parsed'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    file = models.FileField(upload_to=generate_filepath, validators=[FileExtensionValidator(allowed_extensions=['gpx', 'fit', 'GPX', 'FIT'], message="Invalid file type.")])
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    activity = models.OneToOneField('Activity', null=True, blank=True, on_delete=models.SET_NULL)
    parse_error = models.TextField(null=True, blank=True)
    processing_status = models.CharField(
        max_length=10,
        choices=PROCESSING_STATUS,
        default='pending'
    )

    def __str__(self):
        return f"{self.original_filename} ({self.file_type.upper()})"

class Activity(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=None)
    name = models.CharField(max_length=255, blank=True, null=True)
    sport = models.CharField(max_length=50)
    bounds = models.JSONField(null=True, blank=True)
    start_time = models.DateTimeField()
    total_elapsed_time = models.FloatField() # seconds
    total_distance = models.FloatField(null=True, blank=True) # meters
    total_calories = models.IntegerField(null=True, blank=True)
    total_ascent = models.FloatField(null=True, blank=True) # Meters
    total_descent = models.FloatField(null=True, blank=True) # Meters
    avg_heart_rate = models.IntegerField(null=True, blank=True) # bpm
    avg_cadence = models.IntegerField(null=True, blank=True) # rpm
    geojson = models.JSONField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['-start_time']

class Record(models.Model):
    activity = models.ForeignKey(Activity, related_name="records", on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    position_lat = models.FloatField(null=True, blank=True)
    position_long = models.FloatField(null=True, blank=True) 
    altitude = models.FloatField(null=True, blank=True) # m
    heart_rate = models.IntegerField(null=True, blank=True) # bpm
    cadence = models.IntegerField(null=True, blank=True) # steps/min
    speed = models.FloatField(null=True, blank=True)  # m/s
    distance = models.FloatField(null=True, blank=True) # m
    temperature = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['timestamp']