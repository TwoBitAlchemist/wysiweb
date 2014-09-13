# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ImageSlideshow',
            fields=[
                ('baseelement_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.BaseElement')),
            ],
            options={
                'abstract': False,
            },
            bases=('main.baseelement',),
        ),
        migrations.CreateModel(
            name='Jumbotron',
            fields=[
                ('baseelement_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.BaseElement')),
            ],
            options={
                'abstract': False,
            },
            bases=('main.baseelement',),
        ),
    ]
