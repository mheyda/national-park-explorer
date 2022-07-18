from django.db import models
from django.contrib.auth.models import AbstractUser

# User data
class CustomUser(AbstractUser):
    first_name = models.CharField(blank=True, max_length=120)
    last_name = models.CharField(blank=True, max_length=120)
    birthdate = models.CharField(blank=True, max_length=120)
    favorites = models.JSONField(default=list, blank=True, null=True)