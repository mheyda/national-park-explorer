from django.core.management.base import BaseCommand
from django.db import transaction
from national_park_explorer.models import ParkImage


class Command(BaseCommand):
    help = "Regenerate resized park images using corrected EXIF orientation logic"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show how many images would be processed without making changes",
        )

        parser.add_argument(
            "--park-id",
            type=str,
            help="Only fix images for a specific park ID",
        )

    def handle(self, *args, **options):
        queryset = ParkImage.objects.exclude(image_original="")

        if options["park_id"]:
            queryset = queryset.filter(park_id=options["park_id"])

        total = queryset.count()

        if options["dry_run"]:
            self.stdout.write(
                self.style.WARNING(
                    f"DRY RUN: {total} ParkImage objects would be reprocessed."
                )
            )
            return

        self.stdout.write(
            f"🔧 Regenerating resized images for {total} ParkImage objects..."
        )

        success = 0
        failures = 0

        for img in queryset.iterator():
            try:
                with transaction.atomic():
                    # This deletes old resized files and recreates them
                    img.save_resized_images()
                    img.save(update_fields=[
                        "image_thumbnail",
                        "image_small",
                        "image_medium",
                        "image_large",
                    ])
                success += 1
            except Exception as e:
                failures += 1
                self.stderr.write(
                    f"⚠️ Failed to fix image {img.pk} (park: {img.park_id}): {e}"
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Done. Fixed {success} images, {failures} failures."
            )
        )
