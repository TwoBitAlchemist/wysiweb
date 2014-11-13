# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0003_auto_20141026_0244'),
    ]

    operations = [
        migrations.AlterField(
            model_name='carousel',
            name='slides',
            field=models.PositiveSmallIntegerField(default=3),
        ),
    ]
