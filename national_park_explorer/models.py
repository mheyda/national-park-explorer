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