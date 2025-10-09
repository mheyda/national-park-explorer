# admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    SyncLog,
    CustomUser, Favorite, Visited,
    Activity, Topic, Park, Address, PhoneNumber, EmailAddress, ParkImage, Multimedia, EntranceFee, EntrancePass, OperatingHours, StandardHours, ExceptionHours,
    Alert, Campground,
    TextChunk,
    UploadedFile, Gpx_Activity, Record
)

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name')
    search_fields = ('username', 'email')


admin.site.register(Favorite)
admin.site.register(Visited)


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ('start_time', 'end_time', 'success', 'parks_processed', 'parks_failed')
    list_filter = ('success',)
    readonly_fields = ('start_time', 'end_time', 'error_summary')


class AddressInline(admin.TabularInline): model = Address; extra = 0; classes = ['collapse']
class PhoneNumberInline(admin.TabularInline): model = PhoneNumber; extra = 0; classes = ['collapse']
class EmailAddressInline(admin.TabularInline): model = EmailAddress; extra = 0; classes = ['collapse']
class ParkImageInline(admin.TabularInline): model = ParkImage; extra = 0; classes = ['collapse']
class MultimediaInline(admin.TabularInline): model = Multimedia; extra = 0; classes = ['collapse']
class EntranceFeeInline(admin.TabularInline): model = EntranceFee; extra = 0; classes = ['collapse']
class EntrancePassInline(admin.TabularInline): model = EntrancePass; extra = 0; classes = ['collapse']
class OperatingHoursInline(admin.TabularInline): model = OperatingHours; extra = 0; classes = ['collapse']

@admin.register(Park)
class ParkAdmin(admin.ModelAdmin):
    list_display = ('fullName', 'parkCode', 'states')
    search_fields = ('name', 'fullName', 'parkCode')
    list_filter = ('states',)
    filter_horizontal = ('activities', 'topics')
    inlines = [
        AddressInline, PhoneNumberInline, EmailAddressInline,
        ParkImageInline, MultimediaInline,
        EntranceFeeInline, EntrancePassInline,
        OperatingHoursInline
    ]


@admin.register(ParkImage)
class ParkImageAdmin(admin.ModelAdmin):
    list_display = ('park', 'title', 'preview_original', 'preview_thumbnail')
    readonly_fields = ('preview_original', 'preview_thumbnail')

    def preview_original(self, obj):
        if obj.image_original:
            return format_html(f'<img src="{obj.image_original.url}" width="150" />')
        return "-"
    preview_original.short_description = "Original"

    def preview_thumbnail(self, obj):
        if obj.image_thumbnail:
            return format_html(f'<img src="{obj.image_thumbnail.url}" width="100" />')
        return "-"
    preview_thumbnail.short_description = "Thumbnail"


@admin.register(StandardHours)
class StandardHoursAdmin(admin.ModelAdmin):
    list_display = ('operating_hours',)


@admin.register(ExceptionHours)
class ExceptionHoursAdmin(admin.ModelAdmin):
    list_display = ('operating_hours', 'name', 'startDate', 'endDate')


# -------- /alert NPS API endpoint data ----------
@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "park_code", "last_updated", "url")
    search_fields = ("title", "description", "park_code", "category")
    list_filter = ("category", "park_code")
    ordering = ("-last_updated",)

# ------- /campgrounds NPS API endpoint data ---------
@admin.register(Campground)
class CampgroundAdmin(admin.ModelAdmin):
    list_display = ('name', 'park_code', 'phone_number', 'email', 'directions_overview_short', 'cell_phone_info', 'internet_info', 'wheelchair_access', 'rv_allowed', 'last_updated')
    search_fields = ('name', 'park_code', 'phone_number', 'email')
    list_filter = ('park_code', 'rv_allowed',)

    readonly_fields = ('raw_data',)

    def directions_overview_short(self, obj):
        if obj.directions_overview:
            return obj.directions_overview[:75] + ("..." if len(obj.directions_overview) > 75 else "")
        return "-"
    directions_overview_short.short_description = 'Directions Overview'


# ------- Text chunking --------
@admin.register(TextChunk)
class TextChunkAdmin(admin.ModelAdmin):
    list_display = ('source_type', 'source_uuid', 'chunk_index', 'short_text', 'created_at')
    search_fields = ('source_uuid', 'chunk_text')
    list_filter = ('source_type',)
    readonly_fields = ('embedding', 'created_at')

    def short_text(self, obj):
        return obj.chunk_text[:75] + ("..." if len(obj.chunk_text) > 75 else "")
    short_text.short_description = 'Chunk Preview'

@admin.register(UploadedFile)
class FileAdmin(admin.ModelAdmin):
    list_display = ('original_filename', 'file_type', 'user', 'uploaded_at', 'processing_status')
    search_fields = ['original_filename']
    list_filter = ('file_type', 'processing_status')


@admin.register(Gpx_Activity)
class GpxActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'sport', 'start_time', 'total_distance', 'uploaded_at')
    search_fields = ('name', 'sport', 'user__username')
    list_filter = ('sport',)


@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ('activity', 'timestamp', 'position_lat', 'position_long', 'altitude', 'heart_rate', 'speed')
    list_filter = ('activity',)
