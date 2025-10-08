from django.contrib import admin
from .models import (
    CustomUser, Favorite, Visited,
    Activity, Topic, Park, Address, PhoneNumber, EmailAddress,
    ParkImage, Multimedia, EntranceFee, EntrancePass,
    OperatingHours, StandardHours, ExceptionHours,
    UploadedFile, Gpx_Activity, Record
)

# --- CUSTOM USER ---
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name')
    search_fields = ('username', 'email')

# --- FAVORITES & VISITED ---
admin.site.register(Favorite)
admin.site.register(Visited)

# --- ACTIVITY & TOPIC ---
@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

# --- PARK AND RELATED MODELS ---
class AddressInline(admin.TabularInline):
    model = Address
    extra = 0

class PhoneNumberInline(admin.TabularInline):
    model = PhoneNumber
    extra = 0

class EmailAddressInline(admin.TabularInline):
    model = EmailAddress
    extra = 0

class ParkImageInline(admin.TabularInline):
    model = ParkImage
    extra = 0

class MultimediaInline(admin.TabularInline):
    model = Multimedia
    extra = 0

class EntranceFeeInline(admin.TabularInline):
    model = EntranceFee
    extra = 0

class EntrancePassInline(admin.TabularInline):
    model = EntrancePass
    extra = 0

class OperatingHoursInline(admin.TabularInline):
    model = OperatingHours
    extra = 0

@admin.register(Park)
class ParkAdmin(admin.ModelAdmin):
    list_display = ('fullName', 'parkCode', 'states')
    search_fields = ('name', 'fullName', 'parkCode')
    list_filter = ('states',)
    inlines = [
        AddressInline, PhoneNumberInline, EmailAddressInline,
        ParkImageInline, MultimediaInline,
        EntranceFeeInline, EntrancePassInline,
        OperatingHoursInline
    ]
    filter_horizontal = ('activities', 'topics')

# --- OPERATING HOURS DETAIL ---
@admin.register(StandardHours)
class StandardHoursAdmin(admin.ModelAdmin):
    list_display = ('operating_hours',)

@admin.register(ExceptionHours)
class ExceptionHoursAdmin(admin.ModelAdmin):
    list_display = ('operating_hours', 'name', 'startDate', 'endDate')

# --- FILE UPLOADS ---
@admin.register(UploadedFile)
class FileAdmin(admin.ModelAdmin):
    list_display = ('original_filename', 'file_type', 'user', 'uploaded_at', 'processing_status')
    search_fields = ['original_filename']
    list_filter = ('file_type', 'processing_status')

# --- GPX ACTIVITY ---
@admin.register(Gpx_Activity)
class GpxActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'sport', 'start_time', 'total_distance', 'uploaded_at')
    search_fields = ('name', 'sport', 'user__username')
    list_filter = ('sport',)

# --- RECORD ---
@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ('activity', 'timestamp', 'position_lat', 'position_long', 'altitude', 'heart_rate', 'speed')
    list_filter = ('activity',)
