from django.contrib import admin
from .models import CustomUser, Favorite, GpxFile

class CustomUserAdmin(admin.ModelAdmin):
    model = CustomUser

class GpxFileAdmin(admin.ModelAdmin):
    search_fields = ['original_filename']  # Enable search by file name

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Favorite)
admin.site.register(GpxFile, GpxFileAdmin)