# models.py

import uuid
import os
from io import BytesIO
from PIL import Image
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.core.files.base import ContentFile
from pgvector.django import VectorField

# Constants
IMAGE_SIZES = {
    "thumbnail": (150, 150),
    "small": (400, 400),
    "medium": (800, 800),
    "large": (1600, 1600),
}

# ---------- Custom User ----------
class CustomUser(AbstractUser):
    first_name = models.CharField(blank=True, max_length=120)
    last_name = models.CharField(blank=True, max_length=120)
    birthdate = models.DateField(blank=True, null=True)


# ---------- Sync Log ----------
class SyncLog(models.Model):
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True)
    success = models.BooleanField(default=False)
    error_summary = models.TextField(blank=True)
    parks_processed = models.PositiveIntegerField(default=0)
    parks_failed = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Sync at {self.start_time} — {'Success' if self.success else 'Failed'}"


# ---------- Favorites & Visited ----------
class Favorite(models.Model):
    park = models.ForeignKey("Park", on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=None)

class Visited(models.Model):
    park = models.ForeignKey("Park", on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=None)


# ---------- NPS API Models ----------
class Activity(models.Model):
    id = models.CharField(primary_key=True, max_length=64)
    name = models.CharField(max_length=255, default="Unnamed Activity")

    def __str__(self):
        return self.name


class Topic(models.Model):
    id = models.CharField(primary_key=True, max_length=64)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Park(models.Model):
    id = models.CharField(primary_key=True, max_length=64)
    parkCode = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    fullName = models.CharField(max_length=255)
    description = models.TextField()
    designation = models.CharField(max_length=100, blank=True, null=True)
    directionsInfo = models.TextField(blank=True, null=True)
    directionsUrl = models.URLField(blank=True, null=True)
    latLong = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    states = models.CharField(max_length=100)
    url = models.URLField(blank=True, null=True)
    weatherInfo = models.TextField(blank=True, null=True)

    activities = models.ManyToManyField(Activity, related_name='parks')
    topics = models.ManyToManyField(Topic, related_name='parks')

    def save(self, *args, **kwargs):
        if self.latLong and (self.latitude is None or self.longitude is None):
            import re
            lat_match = re.search(r'lat:([-\d.]+)', self.latLong)
            long_match = re.search(r'long:([-\d.]+)', self.latLong)
            self.latitude = float(lat_match.group(1)) if lat_match else None
            self.longitude = float(long_match.group(1)) if long_match else None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.fullName


class Address(models.Model):
    park = models.ForeignKey(Park, on_delete=models.CASCADE, related_name='addresses')
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True, null=True)
    line3 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    stateCode = models.CharField(max_length=10)
    countryCode = models.CharField(max_length=10)
    provinceTerritoryCode = models.CharField(max_length=10, blank=True, null=True)
    postalCode = models.CharField(max_length=20)
    type = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.line1}, {self.city}"


class PhoneNumber(models.Model):
    park = models.ForeignKey(Park, on_delete=models.CASCADE, related_name='phone_numbers')
    phoneNumber = models.CharField(max_length=30)
    description = models.CharField(max_length=255, blank=True, null=True)
    extension = models.CharField(max_length=10, blank=True, null=True)
    type = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.type}: {self.phoneNumber}"


class EmailAddress(models.Model):
    park = models.ForeignKey(Park, on_delete=models.CASCADE, related_name='email_addresses')
    emailAddress = models.EmailField()
    description = models.CharField(max_length=1024, blank=True, null=True)

    def __str__(self):
        return self.emailAddress


def upload_path_original(instance, filename):
    return f"parks/{instance.park.parkCode}/original/{filename}"

def upload_path_thumbnail(instance, filename):
    return f"parks/{instance.park.parkCode}/thumbnail/{filename}"

def upload_path_small(instance, filename):
    return f"parks/{instance.park.parkCode}/small/{filename}"

def upload_path_medium(instance, filename):
    return f"parks/{instance.park.parkCode}/medium/{filename}"

def upload_path_large(instance, filename):
    return f"parks/{instance.park.parkCode}/large/{filename}"

class ParkImage(models.Model):
    park = models.ForeignKey('Park', on_delete=models.CASCADE, related_name="images")
    title = models.CharField(max_length=255, blank=True)
    altText = models.CharField(max_length=255, blank=True)
    caption = models.TextField(blank=True)
    credit = models.CharField(max_length=255, blank=True)
    image_original = models.ImageField(upload_to=upload_path_original, blank=True, null=True)
    image_thumbnail = models.ImageField(upload_to=upload_path_thumbnail, blank=True, null=True)
    image_small = models.ImageField(upload_to=upload_path_small, blank=True, null=True)
    image_medium = models.ImageField(upload_to=upload_path_medium, blank=True, null=True)
    image_large = models.ImageField(upload_to=upload_path_large, blank=True, null=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._image_original = self.image_original

    def delete_file(self, file_field):
        """Deletes file from storage if it exists."""
        if file_field and hasattr(file_field, 'storage') and file_field.name:
            file_field.storage.delete(file_field.name)

    def save_resized_images(self):
        # Delete previous resized versions
        for size in IMAGE_SIZES:
            self.delete_file(getattr(self, f"image_{size}"))

        if not self.image_original:
            return

        try:
            img = Image.open(self.image_original)
            if img.mode != "RGB":
                img = img.convert("RGB")

            filename = os.path.basename(self.image_original.name)

            for size_name, size in IMAGE_SIZES.items():
                resized = img.copy()
                resized.thumbnail(size, Image.LANCZOS)

                buffer = BytesIO()
                resized.save(buffer, format="JPEG", quality=85)
                file_content = ContentFile(buffer.getvalue())

                resized_field = getattr(self, f"image_{size_name}")
                resized_field.save(filename, file_content, save=False)

        except Exception as e:
            print(f"⚠️ Failed to resize image: {e}")

    def save(self, *args, **kwargs):
        is_new_image = self.pk is None or self.image_original != self._image_original
        if is_new_image:
            for size in IMAGE_SIZES:
                self.delete_file(getattr(self, f"image_{size}"))

        super().save(*args, **kwargs)  # Save original image

        if is_new_image:
            self.save_resized_images()
            super().save(*args, **kwargs)  # Save resized images only if changed

        self._image_original = self.image_original

    def delete(self, *args, **kwargs):
        # Delete all resized images
        for size in IMAGE_SIZES:
            self.delete_file(getattr(self, f"image_{size}"))
        self.delete_file(self.image_original)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.title or f"Image for {self.park.name}"


class Multimedia(models.Model):
    park = models.ForeignKey(Park, on_delete=models.CASCADE, related_name='multimedia')
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    url = models.URLField()
    multimedia_id = models.CharField(max_length=64)

    def __str__(self):
        return self.title


class EntranceFee(models.Model):
    park = models.ForeignKey(Park, on_delete=models.CASCADE, related_name='entrance_fees')
    cost = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField()
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class EntrancePass(models.Model):
    park = models.ForeignKey(Park, on_delete=models.CASCADE, related_name='entrance_passes')
    cost = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField()
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class OperatingHours(models.Model):
    park = models.ForeignKey(Park, on_delete=models.CASCADE, related_name='operating_hours')
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name


class StandardHours(models.Model):
    operating_hours = models.ForeignKey(OperatingHours, on_delete=models.CASCADE, related_name='standard_hours')
    sunday = models.CharField(max_length=100)
    monday = models.CharField(max_length=100)
    tuesday = models.CharField(max_length=100)
    wednesday = models.CharField(max_length=100)
    thursday = models.CharField(max_length=100)
    friday = models.CharField(max_length=100)
    saturday = models.CharField(max_length=100)


class ExceptionHours(models.Model):
    operating_hours = models.ForeignKey(OperatingHours, on_delete=models.CASCADE, related_name='exceptions')
    name = models.CharField(max_length=255)
    startDate = models.DateField()
    endDate = models.DateField()
    sunday = models.CharField(max_length=100)
    monday = models.CharField(max_length=100)
    tuesday = models.CharField(max_length=100)
    wednesday = models.CharField(max_length=100)
    thursday = models.CharField(max_length=100)
    friday = models.CharField(max_length=100)
    saturday = models.CharField(max_length=100)


# ---------- /alerts NPS API endpoint data -------------
class Alert(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    alert_id = models.TextField(unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    park_code = models.CharField(max_length=20)
    last_updated = models.DateTimeField(max_length=500, blank=True, null=True)
    raw_data = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.title

# ---------- /campgrounds NPS API endpoint data -------------
class Campground(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    campground_id = models.TextField(unique=True)
    park_code = models.CharField(max_length=10, db_index=True)
    name = models.CharField(max_length=1024)
    url = models.URLField(max_length=1024, blank=True, null=True)
    description = models.TextField(max_length=1024, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    last_updated = models.DateTimeField(blank=True, null=True)

    # Flattened contact info (just storing first phone and email for simplicity)
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    phone_description = models.CharField(max_length=1024, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    email_description = models.CharField(max_length=1024, blank=True, null=True)

    # Directions overview and url
    directions_overview = models.TextField(max_length=1024, blank=True, null=True)
    directions_url = models.URLField(blank=True, null=True)

    # Accessibility and connectivity info
    cell_phone_info = models.CharField(max_length=1024, blank=True, null=True)
    internet_info = models.CharField(max_length=1024, blank=True, null=True)
    wheelchair_access = models.CharField(max_length=1024, blank=True, null=True)
    fire_stove_policy = models.TextField(max_length=1024, blank=True, null=True)
    rv_allowed = models.BooleanField(default=False)
    rv_info = models.TextField(max_length=1024, blank=True, null=True)
    rv_max_length = models.IntegerField(blank=True, null=True)
    trailer_allowed = models.BooleanField(default=False)
    trailer_max_length = models.IntegerField(blank=True, null=True)

    # Raw JSON data saved for any additional info
    raw_data = models.JSONField()

    def __str__(self):
        return self.name


# ------ Text chunking for LLM ------
# national_park_explorer/models.py (or your chosen app)
class TextChunk(models.Model):
    SOURCE_CHOICES = [
        ('alert', 'Alert'),
        ('campground', 'Campground'),
    ]

    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    source_uuid = models.UUIDField(null=True, blank=True)
    chunk_index = models.IntegerField()  # position of chunk in original text
    chunk_text = models.TextField()
    embedding = VectorField()  # all-MiniLM-L6-v2 output dim

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('source_type', 'source_uuid', 'chunk_index')
        indexes = [
            models.Index(fields=['source_type', 'source_uuid']),
        ]

    def __str__(self):
        return f"{self.source_type} #{self.source_uuid} - chunk {self.chunk_index}"


# ---------- File Uploads ----------
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
    file = models.FileField(upload_to=generate_filepath, validators=[
        FileExtensionValidator(allowed_extensions=['gpx', 'fit', 'GPX', 'FIT'], message="Invalid file type.")
    ])
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    activity = models.OneToOneField('Gpx_Activity', null=True, blank=True, on_delete=models.SET_NULL)
    parse_error = models.TextField(null=True, blank=True)
    processing_status = models.CharField(max_length=10, choices=PROCESSING_STATUS, default='pending')

    def __str__(self):
        return f"{self.original_filename} ({self.file_type.upper()})"


class Gpx_Activity(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=None)
    name = models.CharField(max_length=255, blank=True, null=True, default="Unnamed Activity")
    sport = models.CharField(max_length=50)
    bounds = models.JSONField(null=True, blank=True)
    start_time = models.DateTimeField()
    total_elapsed_time = models.FloatField()
    total_distance = models.FloatField(null=True, blank=True)
    total_calories = models.IntegerField(null=True, blank=True)
    total_ascent = models.FloatField(null=True, blank=True)
    total_descent = models.FloatField(null=True, blank=True)
    avg_heart_rate = models.IntegerField(null=True, blank=True)
    avg_cadence = models.IntegerField(null=True, blank=True)
    geojson = models.JSONField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['-start_time']
        db_table = 'activity'


class Record(models.Model):
    activity = models.ForeignKey(Gpx_Activity, related_name="records", on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    position_lat = models.FloatField(null=True, blank=True)
    position_long = models.FloatField(null=True, blank=True)
    altitude = models.FloatField(null=True, blank=True)
    heart_rate = models.IntegerField(null=True, blank=True)
    cadence = models.IntegerField(null=True, blank=True)
    speed = models.FloatField(null=True, blank=True)
    distance = models.FloatField(null=True, blank=True)
    temperature = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['timestamp']
