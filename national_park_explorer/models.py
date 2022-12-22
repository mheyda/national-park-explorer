from django.db import models
from django.contrib.auth.models import AbstractUser

# User data
class CustomUser(AbstractUser):
    first_name = models.CharField(blank=True, max_length=120)
    last_name = models.CharField(blank=True, max_length=120)
    birthdate = models.CharField(blank=True, max_length=120)

class Favorite(models.Model):
    park_id = models.CharField(blank=True, max_length=120)
    user = models.ForeignKey(CustomUser, on_delete = models.CASCADE, default = None)