# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import main.models
import mptt.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='BaseNode',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('index', models.PositiveSmallIntegerField(default=0)),
                ('lft', models.PositiveIntegerField(editable=False, db_index=True)),
                ('rght', models.PositiveIntegerField(editable=False, db_index=True)),
                ('tree_id', models.PositiveIntegerField(editable=False, db_index=True)),
                ('level', models.PositiveIntegerField(editable=False, db_index=True)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model, main.models.SelfRendering),
        ),
        migrations.CreateModel(
            name='BaseElement',
            fields=[
                ('basenode_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.BaseNode')),
                ('text', models.TextField(default=b'', blank=True)),
            ],
            options={
                'abstract': False,
            },
            bases=('main.basenode',),
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('elements', models.ManyToManyField(related_name=b'documents', to='main.BaseElement')),
            ],
            options={
            },
            bases=(models.Model, main.models.SelfRendering),
        ),
        migrations.CreateModel(
            name='MediaObject',
            fields=[
                ('basenode_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.BaseNode')),
                ('parent_element', models.ForeignKey(related_name=b'media', to='main.BaseElement')),
            ],
            options={
                'abstract': False,
            },
            bases=('main.basenode',),
        ),
        migrations.AddField(
            model_name='basenode',
            name='parent',
            field=mptt.fields.TreeForeignKey(related_name=b'children', blank=True, to='main.BaseNode', null=True),
            preserve_default=True,
        ),
    ]
