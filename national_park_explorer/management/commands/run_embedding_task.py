# national_park_explorer/management/commands/run_embedding_task.py

from django.core.management.base import BaseCommand
from sentence_transformers import SentenceTransformer
from national_park_explorer.models import Alert, Campground, TextChunk
from django.db import transaction
from tqdm import tqdm

CHUNK_CHAR_LIMIT = 500  # adjust based on performance vs. granularity

def chunk_text(text, max_chars=CHUNK_CHAR_LIMIT):
    """Simple character-based chunking. You can improve with sentence-based."""
    if not text:
        return []

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


class Command(BaseCommand):
    help = "Chunk and embed Alerts and Campgrounds using all-MiniLM-L6-v2"

    def handle(self, *args, **kwargs):
        self.stdout.write("🔍 Loading embedding model...")
        model = SentenceTransformer("all-MiniLM-L6-v2")

        # === Process Alerts ===
        self.stdout.write("⚙️ Embedding Alerts...")
        for alert in tqdm(Alert.objects.all(), desc="Processing Alerts"):
            combined_text = self._get_alert_text(alert)
            self._process_instance(model, alert, "alert", combined_text)

        # === Process Campgrounds ===
        self.stdout.write("⚙️ Embedding Campgrounds...")
        for cg in tqdm(Campground.objects.all(), desc="Processing Campgrounds"):
            combined_text = self._get_campground_text(cg)
            self._process_instance(model, cg, "campground", combined_text)

        self.stdout.write(self.style.SUCCESS("✅ Embedding complete."))

    def _get_alert_text(self, alert):
        fields = [
            alert.title,
            alert.description,
            alert.category,
            alert.url,
            # Add more Alert fields if you want
        ]
        return "\n".join(filter(None, fields))

    def _get_campground_text(self, cg):
        fields = [
            cg.name,
            cg.description,
            cg.directions_overview,
            cg.directions_url,
            cg.cell_phone_info,
            cg.internet_info,
            cg.wheelchair_access,
            cg.fire_stove_policy,
            cg.rv_info,
            # Add more Campground fields if you want
        ]
        return "\n".join(filter(None, fields))

    def _process_instance(self, model, obj, source_type, text):
        chunks = chunk_text(text)
        if not chunks:
            return

        # Avoid duplicate entries if re-running
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
                )
