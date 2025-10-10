# national_park_explorer/management/commands/run_embedding_task.py

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
CHUNK_CHAR_LIMIT = 500
USE_SENTENCE_CHUNKING = True

logger = logging.getLogger(__name__)

def chunk_text(text, max_chars=CHUNK_CHAR_LIMIT, use_sentence_chunking=USE_SENTENCE_CHUNKING):
    """Chunk text into manageable sizes, optionally using sentence boundaries."""
    if not text:
        return []

    if not use_sentence_chunking:
        # Simple character-based
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

    # Sentence-based chunking
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
            combined_text = self._build_alert_text(alert)
            self._embed_instance(model, alert, "alert", combined_text)

        # === Campgrounds ===
        self.stdout.write("⚙️ Embedding Campgrounds...")
        for cg in tqdm(Campground.objects.all(), desc="Processing Campgrounds"):
            combined_text = self._build_campground_text(cg)
            self._embed_instance(model, cg, "campground", combined_text)

        # === Parks ===
        self.stdout.write("⚙️ Embedding Parks...")
        for park in tqdm(Park_Data.objects.all(), desc="Processing Parks"):
            chunk_map = self._build_park_chunks(park)
            for chunk_type, text in chunk_map.items():
                if text:
                    self._embed_instance(model, park, "park", text, chunk_type)

        self.stdout.write(self.style.SUCCESS("✅ Embedding complete."))

    def _build_alert_text(self, alert):
        return "\n".join(filter(None, [
            f"[Alert] {alert.title}",
            alert.description,
            f"Category: {alert.category}",
            f"Park Code: {alert.park_code}",
            alert.url,
        ]))

    def _build_campground_text(self, cg):
        return "\n".join(filter(None, [
            f"[Campground] {cg.name}",
            cg.description,
            f"Directions: {cg.directions_overview}",
            f"URL: {cg.directions_url}",
            f"Cell Info: {cg.cell_phone_info}",
            f"Internet: {cg.internet_info}",
            f"Wheelchair Access: {cg.wheelchair_access}",
            f"Fire Policy: {cg.fire_stove_policy}",
            f"RV Info: {cg.rv_info}",
        ]))

    def _build_park_chunks(self, park):
        activity_str = ", ".join(park.activity_names or [])
        topic_str = ", ".join(park.topic_names or [])

        return {
            "description": "\n".join(filter(None, [
                f"[Park] {park.full_name or park.name}",
                park.description,
            ])),
            "directions": "\n".join(filter(None, [
                f"Directions: {park.directions_info}",
                f"URL: {park.directions_url}",
            ])),
            "weather": park.weather_info,
            "activities": f"Activities: {activity_str}" if activity_str else None,
            "topics": f"Topics: {topic_str}" if topic_str else None,
            "fees": "\n".join(filter(None, [
                f"Entrance Fee: {park.entrance_fee_title} - {park.entrance_fee_description} (${park.entrance_fee_cost})",
                f"Entrance Pass: {park.entrance_pass_title} - {park.entrance_pass_description} (${park.entrance_pass_cost})",
            ])),
            "contact": "\n".join(filter(None, [
                f"Phone: {park.phone_number} ({park.phone_type})",
                f"Email: {park.email}",
                f"Mailing Address: {park.mailing_address_line1}, {park.mailing_city}, {park.mailing_state} {park.mailing_postal_code}",
            ])),
        }

    def _embed_instance(self, model, obj, source_type, text, chunk_type=None):
        chunks = chunk_text(text)
        if not chunks:
            return

        # Remove any existing entries for this object
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
                )