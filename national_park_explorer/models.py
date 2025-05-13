import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.utils import timezone


# User data
class CustomUser(AbstractUser):
    first_name = models.CharField(blank=True, max_length=120)
    last_name = models.CharField(blank=True, max_length=120)
    birthdate = models.CharField(blank=True, max_length=120)

# Favorites
class Favorite(models.Model):
    park_id = models.CharField(blank=True, max_length=120)
    user = models.ForeignKey(CustomUser, on_delete = models.CASCADE, default = None)

# User uploaded gpx files
def generate_filepath(self, filename):
    ext = filename.split('.')[-1]
    filename = "%s.%s" % (uuid.uuid4(), ext)
    path = "files/users/%s/gpx/%s" % (self.user.username, filename)
    return path

class GpxFile(models.Model):
    user = models.ForeignKey(CustomUser, on_delete = models.CASCADE, default = None)
    file = models.FileField(upload_to=generate_filepath,  validators=[FileExtensionValidator(allowed_extensions=['gpx'], message="Invalid file type.")])
    original_filename = models.CharField(blank=True, max_length=255)
    bounds = models.JSONField(null=True, blank=True)
    distance = models.FloatField(null=True, blank=True) # Meters
    timer_time = models.IntegerField(null=True, blank=True) # seconds
    total_elapsed_time = models.IntegerField(null=True, blank=True) # seconds
    moving_time = models.IntegerField(null=True, blank=True) # seconds
    max_speed = models.FloatField(null=True, blank=True) # m/s
    ascent = models.FloatField(null=True, blank=True) # Meters
    descent = models.FloatField(null=True, blank=True) # Meters
    calories = models.IntegerField(null=True, blank=True)
    avg_heart_rate = models.IntegerField(null=True, blank=True) # bpm
    avg_cadence = models.IntegerField(null=True, blank=True) # rpm
    geojson = models.JSONField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True, null=True)