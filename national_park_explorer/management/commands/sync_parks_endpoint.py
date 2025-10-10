# national_park_explorer/management/commands/sync_parks_endpoint.py

import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from national_park_explorer.models import Park_Data
from datetime import datetime
from django.utils.timezone import make_aware
import traceback

class Command(BaseCommand):
    help = 'Sync park data from the NPS API'

    def handle(self, *args, **kwargs):
        API_KEY = getattr(settings, 'NPS_API_KEY', None)
        if not API_KEY:
            self.stderr.write("❌ NPS_API_KEY not found in settings.")
            return

        endpoint = "https://developer.nps.gov/api/v1/parks"
        start = 0
        limit = 1000
        total_imported = 0
        total_failed = 0

        while True:
            params = {
                "api_key": API_KEY,
                "limit": limit,
                "start": start,
            }

            response = requests.get(endpoint, params=params)
            if response.status_code != 200:
                self.stderr.write(f"❌ API error: {response.status_code}")
                break

            data = response.json()
            parks = data.get("data", [])
            if not parks:
                break

            for park in parks:
                park_id = park.get("id")
                if not park_id:
                    continue

                try:
                    # Parse lat/long from string
                    lat_long = park.get("latLong", "")
                    lat = long = None
                    if lat_long:
                        try:
                            lat_str = lat_long.split("lat:")[1].split(",")[0].strip()
                            long_str = lat_long.split("long:")[1].strip()
                            lat = float(lat_str)
                            long = float(long_str)
                        except (IndexError, ValueError):
                            pass  # Skip parsing lat/long if format is unexpected

                    # Contact info
                    contacts = park.get("contacts", {})
                    phone_number = phone_type = email = None
                    phone_numbers = contacts.get("phoneNumbers", [])
                    if phone_numbers:
                        phone_number = phone_numbers[0].get("phoneNumber")
                        phone_type = phone_numbers[0].get("type")

                    email_addresses = contacts.get("emailAddresses", [])
                    if email_addresses:
                        email = email_addresses[0].get("emailAddress")

                    # Mailing address (first one of type 'Mailing')
                    mailing_address = next((a for a in park.get("addresses", []) if a.get("type") == "Mailing"), {})
                    mailing_line1 = mailing_address.get("line1")
                    mailing_line2 = mailing_address.get("line2")
                    mailing_city = mailing_address.get("city")
                    mailing_state = mailing_address.get("stateCode")
                    mailing_postal_code = mailing_address.get("postalCode")

                    # Activities and topics as flat name lists
                    activity_names = [a.get("name") for a in park.get("activities", []) if a.get("name")]
                    topic_names = [t.get("name") for t in park.get("topics", []) if t.get("name")]

                    # Entrance fees (first one only)
                    fee = (park.get("entranceFees") or [{}])[0]
                    fee_title = fee.get("title")
                    fee_cost = float(fee.get("cost")) if fee.get("cost") else None
                    fee_description = fee.get("description")

                    # Entrance passes (first one only)
                    pass_ = (park.get("entrancePasses") or [{}])[0]
                    pass_title = pass_.get("title")
                    pass_cost = float(pass_.get("cost")) if pass_.get("cost") else None
                    pass_description = pass_.get("description")

                    # First image
                    image = (park.get("images") or [{}])[0]
                    image_url = image.get("url")
                    image_title = image.get("title")
                    image_alt_text = image.get("altText")
                    image_caption = image.get("caption")

                    # Upsert park
                    obj, created = Park_Data.objects.update_or_create(
                        park_id=park_id,
                        defaults={
                            "park_code": park.get("parkCode"),
                            "full_name": park.get("fullName"),
                            "name": park.get("name"),
                            "designation": park.get("designation"),
                            "description": park.get("description"),
                            "url": park.get("url"),
                            "directions_info": park.get("directionsInfo"),
                            "directions_url": park.get("directionsUrl"),
                            "weather_info": park.get("weatherInfo"),
                            "latitude": lat,
                            "longitude": long,
                            "states": park.get("states"),
                            "phone_number": phone_number,
                            "phone_type": phone_type,
                            "email": email,
                            "mailing_address_line1": mailing_line1,
                            "mailing_address_line2": mailing_line2,
                            "mailing_city": mailing_city,
                            "mailing_state": mailing_state,
                            "mailing_postal_code": mailing_postal_code,
                            "activity_names": activity_names,
                            "topic_names": topic_names,
                            "entrance_fee_title": fee_title,
                            "entrance_fee_cost": fee_cost,
                            "entrance_fee_description": fee_description,
                            "entrance_pass_title": pass_title,
                            "entrance_pass_cost": pass_cost,
                            "entrance_pass_description": pass_description,
                            "image_url": image_url,
                            "image_title": image_title,
                            "image_alt_text": image_alt_text,
                            "image_caption": image_caption,
                            "last_updated": make_aware(datetime.now()),
                            "raw_data": park,
                        }
                    )

                    total_imported += 1

                except Exception as e:
                    total_failed += 1
                    self.stderr.write(f"\n❌ Failed to process park ID {park_id}: {e}")
                    self.stderr.write(traceback.format_exc())

            start += limit
            self.stdout.write(f"✅ Imported {len(parks)} parks (total so far: {total_imported})")

        self.stdout.write(self.style.SUCCESS(f"🎉 Finished syncing {total_imported} parks."))
        if total_failed > 0:
            self.stderr.write(self.style.WARNING(f"⚠️ {total_failed} parks failed to import."))
