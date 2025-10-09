import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from national_park_explorer.models import Campground
from datetime import datetime
from django.utils.timezone import make_aware

class Command(BaseCommand):
    help = 'Sync campground data from the NPS API'

    def handle(self, *args, **kwargs):
        API_KEY = getattr(settings, 'NPS_API_KEY', None)
        if not API_KEY:
            self.stderr.write("❌ NPS_API_KEY not found in settings.")
            return

        endpoint = "https://developer.nps.gov/api/v1/campgrounds"
        start = 0
        limit = 1000
        total_imported = 0

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
            campgrounds = data.get("data", [])
            if not campgrounds:
                break

            for cg in campgrounds:
                cg_id = cg.get("id")
                if not cg_id:
                    continue

                # Parse date
                last_updated_raw = cg.get("lastIndexedDate")
                last_updated = None

                if last_updated_raw and last_updated_raw.strip():
                    try:
                        last_updated = make_aware(
                            datetime.strptime(last_updated_raw.strip(), "%Y-%m-%d %H:%M:%S.%f")
                        )
                    except Exception as e:
                        self.stderr.write(f"⚠️ Failed to parse date '{last_updated_raw}': {e}")


                # Flatten contacts
                phone_number = None
                phone_description = None
                emails = None
                email_description = None

                contacts = cg.get("contacts", {})
                phone_numbers = contacts.get("phoneNumbers", [])
                if phone_numbers:
                    phone = phone_numbers[0]
                    phone_number = phone.get("phoneNumber")
                    phone_description = phone.get("description", "")

                email_addresses = contacts.get("emailAddresses", [])
                if email_addresses:
                    email = email_addresses[0]
                    emails = email.get("emailAddress")
                    email_description = email.get("description", "")

                # Accessibility info
                accessibility = cg.get("accessibility", {})
                cell_phone_info = accessibility.get("cellPhoneInfo")
                internet_info = accessibility.get("internetInfo")
                wheelchair_access = accessibility.get("wheelchairAccess")
                fire_stove_policy = accessibility.get("fireStovePolicy")
                rv_allowed = bool(int(accessibility.get("rvAllowed", "0")))
                rv_info = accessibility.get("rvInfo")

                rv_max_length = None
                try:
                    rv_max_length = int(accessibility.get("rvMaxLength", "0"))
                    if rv_max_length == 0:
                        rv_max_length = None
                except (ValueError, TypeError):
                    rv_max_length = None

                trailer_allowed = bool(int(accessibility.get("trailerAllowed", "0")))
                trailer_max_length = None
                try:
                    trailer_max_length = int(accessibility.get("trailerMaxLength", "0"))
                    if trailer_max_length == 0:
                        trailer_max_length = None
                except (ValueError, TypeError):
                    trailer_max_length = None

                # Upsert campground
                obj, created = Campground.objects.update_or_create(
                    campground_id=cg_id,
                    defaults={
                        "park_code": cg.get("parkCode"),
                        "name": cg.get("name"),
                        "url": cg.get("url"),
                        "description": cg.get("description"),
                        "latitude": float(cg.get("latitude")) if cg.get("latitude") else None,
                        "longitude": float(cg.get("longitude")) if cg.get("longitude") else None,
                        "last_updated": last_updated,
                        "phone_number": phone_number,
                        "phone_description": phone_description,
                        "email": emails,
                        "email_description": email_description,
                        "directions_overview": cg.get("directionsOverview"),
                        "directions_url": cg.get("directionsUrl"),
                        "cell_phone_info": cell_phone_info,
                        "internet_info": internet_info,
                        "wheelchair_access": wheelchair_access,
                        "fire_stove_policy": fire_stove_policy,
                        "rv_allowed": rv_allowed,
                        "rv_info": rv_info,
                        "rv_max_length": rv_max_length,
                        "trailer_allowed": trailer_allowed,
                        "trailer_max_length": trailer_max_length,
                        "raw_data": cg,
                    }
                )
                total_imported += 1

            start += limit
            self.stdout.write(f"✅ Imported {len(campgrounds)} campgrounds (total so far: {total_imported})")

        self.stdout.write(self.style.SUCCESS(f"🎉 Finished syncing {total_imported} campgrounds."))
