# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_document_owner'),
    ]

    operations = [
        migrations.CreateModel(
            name='GridRow',
            fields=[
                ('basenode_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.BaseNode')),
                ('elements', models.ManyToManyField(related_name=b'containing_rows', to='main.BaseElement')),
            ],
            options={
                'abstract': False,
            },
            bases=('main.basenode',),
        ),
        migrations.RemoveField(
            model_name='document',
            name='elements',
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_lg',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_lg_offset',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_lg_pull',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_lg_push',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_md',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_md_offset',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_md_pull',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_md_push',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_sm',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_sm_offset',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_sm_pull',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_sm_push',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_xs',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_xs_offset',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_xs_pull',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='baseelement',
            name='col_xs_push',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='document',
            name='is_fluid',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='document',
            name='rows',
            field=models.ManyToManyField(related_name=b'documents', to='main.GridRow'),
            preserve_default=True,
        ),
    ]
