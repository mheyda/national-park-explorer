# Generated by Django 4.0.5 on 2025-05-07 23:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('national_park_explorer', '0006_populate_bounds'),
    ]

    operations = [
        migrations.AddField(
            model_name='gpxfile',
            name='geojson',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='gpxfile',
            name='uploaded_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
