import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils.timezone import make_aware
from national_park_explorer.models import Alert
from datetime import datetime
import traceback

class Command(BaseCommand):
    help = 'Sync alert data from the NPS API'

    def handle(self, *args, **kwargs):
        API_KEY = getattr(settings, 'NPS_API_KEY', None)
        if not API_KEY:
            self.stderr.write("❌ NPS_API_KEY not found in settings.")
            return

        endpoint = "https://developer.nps.gov/api/v1/alerts"
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
            alerts = data.get("data", [])
            if not alerts:
                break

            for alert in alerts:
                alert_id = alert.get("id")
                if not alert_id:
                    continue

                try:
                    # Parse date
                    last_updated = alert.get("lastIndexedDate")
                    if last_updated:
                        try:
                            last_updated = make_aware(
                                datetime.strptime(last_updated, "%Y-%m-%d %H:%M:%S.%f")
                            )
                        except Exception as e:
                            self.stderr.write(f"⚠️ Failed to parse date '{last_updated}': {e}")
                            last_updated = None

                    # Upsert alert
                    obj, created = Alert.objects.update_or_create(
                        alert_id=alert_id,
                        defaults={
                            "title": alert.get("title"),
                            "description": alert.get("description"),
                            "category": alert.get("category"),
                            "url": alert.get("url"),
                            "park_code": alert.get("parkCode"),
                            "last_updated": last_updated,
                            "raw_data": alert,
                        }
                    )
                    total_imported += 1

                except Exception as e:
                    total_failed += 1
                    self.stderr.write(f"\n❌ Failed to process alert ID {alert_id}: {e}")
                    self.stderr.write(traceback.format_exc())

                    self.stderr.write("🔍 Field lengths for debugging:")
                    field_data = {
                        "alert_id": alert_id,
                        "title": alert.get("title"),
                        "description": alert.get("description"),
                        "category": alert.get("category"),
                        "url": alert.get("url"),
                        "park_code": alert.get("parkCode"),
                        "last_updated": alert.get("lastIndexedDate"),
                    }

            start += limit
            self.stdout.write(f"✅ Imported {len(alerts)} alerts in this batch (total so far: {total_imported})")

        self.stdout.write(self.style.SUCCESS(f"🎉 Finished syncing {total_imported} alerts."))
        if total_failed > 0:
            self.stderr.write(self.style.WARNING(f"⚠️ {total_failed} alerts failed to import."))
