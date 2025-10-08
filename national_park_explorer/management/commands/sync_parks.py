import requests
import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from django.core.files.storage import default_storage

from national_park_explorer.models import (
    Park, Activity, Topic,
    Address, PhoneNumber, EmailAddress,
    ParkImage, EntranceFee, EntrancePass,
    OperatingHours, StandardHours, ExceptionHours
)

API_URL = "https://developer.nps.gov/api/v1/parks"
API_KEY = os.environ.get("NPS_API_KEY") or getattr(settings, "NPS_API_KEY", None)

class Command(BaseCommand):
    help = "Sync park data from NPS API"

    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            help='Fetch and sync only one park (Yellowstone)'
        )

    def sync_park(self, park_data):
        park, _ = Park.objects.update_or_create(
            id=park_data["id"],
            defaults={
                "parkCode": park_data.get("parkCode"),
                "name": park_data.get("name"),
                "fullName": park_data.get("fullName"),
                "description": park_data.get("description"),
                "designation": park_data.get("designation"),
                "directionsInfo": park_data.get("directionsInfo"),
                "directionsUrl": park_data.get("directionsUrl"),
                "latLong": park_data.get("latLong"),
                "states": park_data.get("states"),
                "url": park_data.get("url"),
                "weatherInfo": park_data.get("weatherInfo"),
            }
        )

        # Sync activities (ManyToMany)
        activity_ids = []
        for activity in park_data.get("activities", []):
            act, _ = Activity.objects.get_or_create(
                id=activity["id"],
                defaults={"name": activity["name"]}
            )
            activity_ids.append(act.id)
        park.activities.set(activity_ids)

        # Sync topics (ManyToMany)
        topic_ids = []
        for topic in park_data.get("topics", []):
            t, _ = Topic.objects.get_or_create(
                id=topic["id"],
                defaults={"name": topic["name"]}
            )
            topic_ids.append(t.id)
        park.topics.set(topic_ids)

        # Sync addresses (replace existing)
        park.addresses.all().delete()
        for addr in park_data.get("addresses", []):
            Address.objects.create(
                park=park,
                line1=addr.get("line1", ""),
                line2=addr.get("line2", ""),
                line3=addr.get("line3", ""),
                city=addr.get("city", ""),
                stateCode=addr.get("stateCode", ""),
                countryCode=addr.get("countryCode", ""),
                provinceTerritoryCode=addr.get("provinceTerritoryCode", ""),
                postalCode=addr.get("postalCode", ""),
                type=addr.get("type", ""),
            )

        # Sync contacts
        park.phone_numbers.all().delete()
        park.email_addresses.all().delete()
        contacts = park_data.get("contacts", {})
        for phone in contacts.get("phoneNumbers", []):
            PhoneNumber.objects.create(
                park=park,
                phoneNumber=phone.get("phoneNumber", ""),
                description=phone.get("description", ""),
                extension=phone.get("extension", ""),
                type=phone.get("type", "")
            )
        for email in contacts.get("emailAddresses", []):
            email_value = email.get('emailAddress', '')

            if len(email_value) > 255:
                print(f"⚠️ Email too long ({len(email_value)} chars): {email_value}")
            EmailAddress.objects.create(
                park=park,
                emailAddress=email.get("emailAddress", ""),
                description=email.get("description", "")
            )

        # Sync entrance fees
        park.entrance_fees.all().delete()
        for fee in park_data.get("entranceFees", []):
            EntranceFee.objects.create(
                park=park,
                cost=fee.get("cost", 0),
                description=fee.get("description", ""),
                title=fee.get("title", "")
            )

        # Sync entrance passes
        park.entrance_passes.all().delete()
        for epass in park_data.get("entrancePasses", []):
            EntrancePass.objects.create(
                park=park,
                cost=epass.get("cost", 0),
                description=epass.get("description", ""),
                title=epass.get("title", "")
            )

        # Sync operating hours
        park.operating_hours.all().delete()
        for hours in park_data.get("operatingHours", []):
            op = OperatingHours.objects.create(
                park=park,
                name=hours.get("name", ""),
                description=hours.get("description", "")
            )
            std = hours.get("standardHours", {})
            if std:
                StandardHours.objects.create(
                    operating_hours=op,
                    sunday=std.get("sunday", ""),
                    monday=std.get("monday", ""),
                    tuesday=std.get("tuesday", ""),
                    wednesday=std.get("wednesday", ""),
                    thursday=std.get("thursday", ""),
                    friday=std.get("friday", ""),
                    saturday=std.get("saturday", "")
                )
            for exc in (hours.get("exceptions") or []):
                try:
                    start = exc["startDate"].split(" ")[0].replace("{ts", "").replace("'", "").strip()
                    end = exc["endDate"].split(" ")[0].replace("{ts", "").replace("'", "").strip()
                except Exception:
                    start = end = None

                exception_hours = exc.get("exceptionHours")
                if not exception_hours:
                    continue

                ExceptionHours.objects.create(
                    operating_hours=op,
                    name=exc.get("name", ""),
                    startDate=start,
                    endDate=end,
                    sunday=exception_hours.get("sunday", ""),
                    monday=exception_hours.get("monday", ""),
                    tuesday=exception_hours.get("tuesday", ""),
                    wednesday=exception_hours.get("wednesday", ""),
                    thursday=exception_hours.get("thursday", ""),
                    friday=exception_hours.get("friday", ""),
                    saturday=exception_hours.get("saturday", ""),
                )

        # Sync images: delete old images from DB and filesystem
        for image in park.images.all():
            if image.image:
                try:
                    default_storage.delete(image.image.name)
                except Exception as e:
                    self.stderr.write(f"⚠️ Could not delete image file: {image.image.name} – {e}")
            image.delete()

        # Download and store new images
        for image_data in park_data.get("images", []):
            image_url = image_data.get("url")
            if not image_url:
                continue

            try:
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()

                content = ContentFile(response.content)
                filename = os.path.basename(image_url)

                img_obj = ParkImage(
                    park=park,
                    title=image_data.get("title", ""),
                    altText=image_data.get("altText", ""),
                    caption=image_data.get("caption", ""),
                    credit=image_data.get("credit", "")
                )
                img_obj.image.save(filename, content, save=True)

            except Exception as e:
                self.stderr.write(f"⚠️ Failed to download image for {park.name}: {e}")

        self.stdout.write(self.style.SUCCESS(f"✅ Synced park: {park.fullName}"))

    def handle(self, *args, **options):
        if not API_KEY:
            self.stderr.write("❌ Missing NPS_API_KEY in environment or settings.")
            return

        headers = {"X-Api-Key": API_KEY}

        if options['test']:
            self.stdout.write("🔍 Running in test mode: syncing one park (Yellowstone)...")

            test_params = {
                "parkCode": "yell",  # Yellowstone
                "limit": 1
            }

            response = requests.get(API_URL, headers=headers, params=test_params)
            if response.status_code != 200:
                self.stderr.write(f"❌ Error fetching test park: {response.status_code}")
                return

            parks = response.json().get("data", [])
            if not parks:
                self.stderr.write("❌ No park data found.")
                return

            self.sync_park(parks[0])
            self.stdout.write(self.style.SUCCESS("🎉 Test park synced."))
            return

        params = {
            "limit": 50,
            "start": 0
        }

        total_parks_synced = 0

        while True:
            response = requests.get(API_URL, headers=headers, params=params)
            if response.status_code != 200:
                self.stderr.write(f"❌ Error fetching parks: {response.status_code}")
                return

            result = response.json()
            parks = result.get("data", [])

            if not parks:
                break

            for park_data in parks:
                self.sync_park(park_data)
                total_parks_synced += 1

            if len(parks) < params["limit"]:
                break

            params["start"] += params["limit"]

        self.stdout.write(self.style.SUCCESS(f"🎉 Total parks synced: {total_parks_synced}"))
