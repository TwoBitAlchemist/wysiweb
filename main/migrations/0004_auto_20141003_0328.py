# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_auto_20141002_0355'),
    ]

    operations = [
        migrations.CreateModel(
            name='GridRow',
            fields=[
                ('basenode_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.BaseNode')),
                ('document', models.ForeignKey(related_name=b'rows', to='main.Document')),
            ],
            options={
            },
            bases=('main.basenode',),
        ),
        migrations.RemoveField(
            model_name='document',
            name='elements',
        ),
        migrations.AddField(
            model_name='baseelement',
            name='row',
            field=models.ForeignKey(related_name=b'elements', default=1, to='main.GridRow'),
            preserve_default=False,
        ),
    ]
