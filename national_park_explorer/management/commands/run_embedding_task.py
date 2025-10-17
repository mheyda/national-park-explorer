from django.core.management.base import BaseCommand
from sentence_transformers import SentenceTransformer
from national_park_explorer.models import Alert, Campground, Park_Data, TextChunk
from django.db import transaction
from tqdm import tqdm
import nltk
from nltk.tokenize import sent_tokenize
import logging

try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")

# Configs
CHUNK_CHAR_LIMIT = 900
USE_SENTENCE_CHUNKING = True

logger = logging.getLogger(__name__)

def chunk_text(text, max_chars=CHUNK_CHAR_LIMIT, use_sentence_chunking=USE_SENTENCE_CHUNKING):
    if not text:
        return []

    if not use_sentence_chunking:
        chunks = []
        while len(text) > max_chars:
            split_index = text.rfind(" ", 0, max_chars)
            if split_index == -1:
                split_index = max_chars
            chunks.append(text[:split_index].strip())
            text = text[split_index:].strip()
        if text:
            chunks.append(text)
        return chunks

    sentences = sent_tokenize(text)
    chunks, current_chunk = [], ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) + 1 <= max_chars:
            current_chunk += " " + sentence if current_chunk else sentence
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence

    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

class Command(BaseCommand):
    help = "Chunk and embed Alerts, Campgrounds, and Parks using all-MiniLM-L6-v2"

    def handle(self, *args, **kwargs):
        self.stdout.write("🔍 Loading embedding model...")
        model = SentenceTransformer("all-MiniLM-L6-v2", cache_folder="/tmp/huggingface")

        # === Alerts ===
        self.stdout.write("⚙️ Embedding Alerts...")
        for alert in tqdm(Alert.objects.all(), desc="Processing Alerts"):
            try:
                park = Park_Data.objects.get(park_code=alert.park_code)
                park_name = park.full_name or park.name
                park_uuid = park.uuid
            except Park_Data.DoesNotExist:
                park_name = "Unknown Park"
                park_uuid = None

            text = "\n".join(filter(None, [
                f"[Alert] {alert.title}",
                f"Park: {park_name}",
                alert.description,
                f"Category: {alert.category}",
                alert.url,
            ]))

            relevance_tags = ["alert_info"]
            if park_uuid:
                relevance_tags.append(f"park_uuid:{str(park_uuid)}")

            self._embed_instance(model, alert, "alert", text, "alert_info", relevance_tags)

        # === Campgrounds ===
        self.stdout.write("⚙️ Embedding Campgrounds...")
        for cg in tqdm(Campground.objects.all(), desc="Processing Campgrounds"):
            try:
                park = Park_Data.objects.get(park_code=cg.park_code)
                park_name = park.full_name or park.name
                park_uuid = park.uuid
            except Park_Data.DoesNotExist:
                park_name = "Unknown Park"
                park_uuid = None

            campground_chunks = {
                "overview": f"[Campground] {cg.name}\nPark: {park_name}\n{cg.description}",
                "directions": f"Directions: {cg.directions_overview}",
                "accessibility": f"Wheelchair Access: {cg.wheelchair_access}\nRV Info: {cg.rv_info}",
                "amenities": f"Amenities: Cell = {cg.cell_phone_info}, Internet = {cg.internet_info}",
                "fire_policy": f"Fire Policy: {cg.fire_stove_policy}",
            }

            relevance_tags_base = ["campground_info"]
            if park_uuid:
                relevance_tags_base.append(f"park_uuid:{str(park_uuid)}")

            for chunk_type, raw_text in campground_chunks.items():
                self._embed_instance(
                    model,
                    cg,
                    "campground",
                    raw_text,
                    chunk_type=chunk_type,
                    relevance_tags=relevance_tags_base + [chunk_type],
                )

        # === Parks ===
        self.stdout.write("⚙️ Embedding Parks...")
        for park in tqdm(Park_Data.objects.all(), desc="Processing Parks"):
            activity_str = ", ".join(park.activity_names or [])
            topic_str = ", ".join(park.topic_names or [])

            park_chunks = {
                "overview": f"[Park] {park.full_name or park.name}\n{park.description}",
                "activities_topics": f"Activities: {activity_str}\nTopics: {topic_str}",
                "directions": f"Directions: {park.directions_info}",
                "weather": f"Weather Info: {park.weather_info}",
                "fees": f"Entrance Fee: {park.entrance_fee_title} - {park.entrance_fee_description} (${park.entrance_fee_cost})",
                "pass": f"Entrance Pass: {park.entrance_pass_title} - {park.entrance_pass_description} (${park.entrance_pass_cost})",
                "contact": f"Contact: {park.phone_number} ({park.phone_type}), Email: {park.email}",
                "address": f"Address: {park.mailing_address_line1}, {park.mailing_city}, {park.mailing_state} {park.mailing_postal_code}",
            }

            for chunk_type, raw_text in park_chunks.items():
                self._embed_instance(
                    model,
                    park,
                    "park_data",
                    raw_text,
                    chunk_type=chunk_type,
                    relevance_tags=["park_info", chunk_type, f"park_uuid:{str(park.uuid)}"],
                )

        self.stdout.write(self.style.SUCCESS("✅ Embedding complete."))

    def _embed_instance(self, model, obj, source_type, text, chunk_type=None, relevance_tags=None):
        chunks = chunk_text(text)
        if not chunks:
            return

        # Clear existing chunks
        TextChunk.objects.filter(source_type=source_type, source_uuid=obj.uuid).delete()

        try:
            embeddings = model.encode(chunks)
        except Exception as e:
            self.stderr.write(f"❌ Embedding failed for {source_type} {obj.id}: {e}")
            return

        with transaction.atomic():
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                TextChunk.objects.create(
                    source_type=source_type,
                    source_uuid=obj.uuid,
                    chunk_index=i,
                    chunk_text=chunk,
                    embedding=embedding.tolist(),
                    chunk_type=chunk_type,
                    relevance_tags=relevance_tags or ([chunk_type] if chunk_type else []),
                )