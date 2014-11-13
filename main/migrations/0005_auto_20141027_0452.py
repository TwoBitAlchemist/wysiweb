# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import main.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('main', '0004_auto_20141003_0328'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserUpload',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('last_modified', models.DateTimeField(auto_now=True)),
                ('uploaded_file', models.FileField(upload_to=b'uploaded_files')),
                ('upload_type', models.PositiveSmallIntegerField(choices=[(0, b'Image/Graphic'), (1, b'Video/Embed'), (2, b'Document/Include')])),
                ('uploaded_by', models.ForeignKey(related_name=b'uploads', to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model, main.models.SelfRendering),
        ),
        migrations.RemoveField(
            model_name='document',
            name='owner',
        ),
        migrations.AddField(
            model_name='document',
            name='attached_files',
            field=models.ManyToManyField(related_name=b'documents', to='main.UserUpload'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='document',
            name='contributors',
            field=models.ManyToManyField(related_name=b'documents', to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='document',
            name='owners',
            field=models.ManyToManyField(related_name=b'documents_owned', to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
    ]
