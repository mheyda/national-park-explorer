from django.contrib import admin
from .models import CustomUser, Favorite

class CustomUserAdmin(admin.ModelAdmin):
    model = CustomUser

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Favorite)