from django.core.management.base import BaseCommand
from national_park_explorer.models import GpxFile
import gpxpy
import xml.etree.ElementTree as ET


class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        files = GpxFile.objects.filter(
            distance__isnull=True,
            timer_time__isnull=True,
            total_elapsed_time__isnull=True,
            moving_time__isnull=True,
            max_speed__isnull=True,
            ascent__isnull=True,
            descent__isnull=True,
            calories__isnull=True,
            avg_heart_rate__isnull=True,
            avg_cadence__isnull=True,
        )

        for file in files:
            try:
                with open(file.file.path, 'r', encoding='utf-8') as f:
                    gpx = gpxpy.parse(f)

                updated = False

                for track in gpx.tracks:
                    if track.extensions:
                        self.stdout.write(self.style.SUCCESS(f'Found extensions for: {file.original_filename}'))

                        for ext in track.extensions:
                            ext_xml = ET.tostring(ext, encoding='unicode')
                            ext_element = ET.fromstring(ext_xml)

                            # Print tag for debugging
                            print(f"ext_element tag: {ext_element.tag}")

                            # Check if this element *is* the TrackStatsExtension
                            if ext_element.tag == '{http://www.garmin.com/xmlschemas/TrackStatsExtension/v1}TrackStatsExtension':
                                self.stdout.write(self.style.SUCCESS(f'Found TrackStatsExtension for: {file.original_filename}'))

                                def parse_float(key):
                                    val = ext_element.findtext(f'{{http://www.garmin.com/xmlschemas/TrackStatsExtension/v1}}{key}')
                                    return float(val) if val else None

                                def parse_int(key):
                                    val = ext_element.findtext(f'{{http://www.garmin.com/xmlschemas/TrackStatsExtension/v1}}{key}')
                                    return int(float(val)) if val else None

                                file.distance = parse_float('Distance')
                                file.timer_time = parse_int('TimerTime')
                                file.total_elapsed_time = parse_int('TotalElapsedTime')
                                file.moving_time = parse_int('MovingTime')
                                file.max_speed = parse_float('MaxSpeed')
                                file.ascent = parse_float('Ascent')
                                file.descent = parse_float('Descent')
                                file.calories = parse_int('Calories')
                                file.avg_heart_rate = parse_int('AvgHeartRate')
                                file.avg_cadence = parse_int('AvgCadence')
                                updated = True

                if updated:
                    file.save()
                    self.stdout.write(self.style.SUCCESS(f'Updated stats for: {file.original_filename}'))
                else:
                    self.stdout.write(self.style.WARNING(f'No track stats found for: {file.original_filename}'))

            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Failed to process {file.original_filename}: {e}'))