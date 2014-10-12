# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_auto_20141003_0328'),
        ('components', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Carousel',
            fields=[
                ('baseelement_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.BaseElement')),
                ('starting_slides', models.PositiveSmallIntegerField(default=3)),
            ],
            options={
                'abstract': False,
            },
            bases=('main.baseelement',),
        ),
        migrations.CreateModel(
            name='PlainText',
            fields=[
                ('baseelement_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.BaseElement')),
            ],
            options={
                'abstract': False,
            },
            bases=('main.baseelement',),
        ),
        migrations.RemoveField(
            model_name='imageslideshow',
            name='baseelement_ptr',
        ),
        migrations.DeleteModel(
            name='ImageSlideshow',
        ),
    ]
