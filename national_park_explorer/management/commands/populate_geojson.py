from django.core.management.base import BaseCommand
from national_park_explorer.models import GpxFile
import gpxpy
import geojson
import json
from django.utils import timezone

class Command(BaseCommand):
    help = 'Parses GPX files and populates the geojson field for GpxFile entries missing it.'

    def handle(self, *args, **kwargs):
        files = GpxFile.objects.filter(geojson__isnull=True)

        for file in files:
            try:
                with open(file.file.path, 'r', encoding='utf-8') as f:
                    gpx = gpxpy.parse(f)

                features = []

                for track in gpx.tracks:
                    for segment in track.segments:
                        coords = []
                        times = []

                        for point in segment.points:
                            lat, lon = point.latitude, point.longitude
                            coords.append([lat, lon,
                                # point.elevation if point.elevation is not None else 0
                            ])
                            times.append(point.time.isoformat() if point.time else None)

                        line = geojson.LineString(coords)
                        feature = geojson.Feature(
                            geometry=line,
                            properties={"times": times}
                        )
                        features.append(feature)

                geojson_obj = geojson.FeatureCollection(features)
                file.geojson = json.loads(geojson.dumps(geojson_obj))
                file.save()
                self.stdout.write(self.style.SUCCESS(f'Updated geojson for {file.original_filename}'))

            
            except Exception as e:
                self.stderr.write(f'Failed to process {file.original_filename}: {e}')