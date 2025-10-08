import os
import requests
from django.core.files.base import ContentFile
from .models import ParkImage

def download_and_save_image(park, image_data):
    image_url = image_data.get('url')
    if not image_url:
        return

    try:
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()

        image_content = ContentFile(response.content)
        filename = os.path.basename(image_url)

        image_obj = ParkImage(
            park=park,
            title=image_data.get('title', ''),
            altText=image_data.get('altText', ''),
            caption=image_data.get('caption', ''),
            credit=image_data.get('credit', ''),
        )

        image_obj.image.save(filename, image_content, save=True)

    except Exception as e:
        print(f"[Error] Failed to download image for {park.name}: {e}")
