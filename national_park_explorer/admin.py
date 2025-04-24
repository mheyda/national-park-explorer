from django.contrib import admin
from .models import CustomUser, Favorite, GpxFile

class CustomUserAdmin(admin.ModelAdmin):
    model = CustomUser

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Favorite)
admin.site.register(GpxFile)