from django.contrib import admin
from .models import CustomUser, Favorite, Visited, UploadedFile, Activity, Record

class CustomUserAdmin(admin.ModelAdmin):
    model = CustomUser

class FileAdmin(admin.ModelAdmin):
    search_fields = ['original_filename']  # Enable search by file name

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Favorite)
admin.site.register(Visited)
admin.site.register(UploadedFile, FileAdmin)
admin.site.register(Record)
admin.site.register(Activity)