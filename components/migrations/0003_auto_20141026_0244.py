# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0002_auto_20141005_0306'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='carousel',
            name='starting_slides',
        ),
        migrations.AddField(
            model_name='carousel',
            name='slides',
            field=models.PositiveSmallIntegerField(default=3, help_text=b'Starting Slides'),
            preserve_default=True,
        ),
    ]
