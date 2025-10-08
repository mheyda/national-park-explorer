import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator


# User data
class CustomUser(AbstractUser):
    first_name = models.CharField(blank=True, max_length=120)
    last_name = models.CharField(blank=True, max_length=120)
    birthdate = models.CharField(blank=True, max_length=120)

# --- NPE MODELS --- #
# Custom feature data
class Favorite(models.Model):
    park_id = models.CharField(blank=True, max_length=120)
    user = models.ForeignKey(CustomUser, on_delete = models.CASCADE, default = None)

class Visited(models.Model):
    park_id = models.CharField(blank=True, max_length=120)
    user = models.ForeignKey(CustomUser, on_delete = models.CASCADE, default = None)


# NPS API Data
from django.db import models

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
        if self.latLong:
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


def park_image_upload_path(instance, filename):
    return f'park_images/{instance.park.parkCode}/{filename}'

class ParkImage(models.Model):
    park = models.ForeignKey('Park', on_delete=models.CASCADE, related_name='images')
    title = models.CharField(max_length=255)
    altText = models.CharField(max_length=255, blank=True, null=True)
    caption = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to=park_image_upload_path)
    credit = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.title


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
# --- END NPE MODELS --- #


# --- MAPS MODELS --- #
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
    activity = models.OneToOneField('Gpx_Activity', null=True, blank=True, on_delete=models.SET_NULL)
    parse_error = models.TextField(null=True, blank=True)
    processing_status = models.CharField(
        max_length=10,
        choices=PROCESSING_STATUS,
        default='pending'
    )

    def __str__(self):
        return f"{self.original_filename} ({self.file_type.upper()})"

class Gpx_Activity(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=None)
    name = models.CharField(max_length=255, blank=True, null=True, default="Unnamed Activity")
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
        db_table = 'activity'

class Record(models.Model):
    activity = models.ForeignKey(Gpx_Activity, related_name="records", on_delete=models.CASCADE)
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
# --- END MAPS MODELS --- #