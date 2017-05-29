# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-29 20:29
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('roomie', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='address3',
            field=models.TextField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='membership',
            name='settings',
            field=models.TextField(blank=True, default=b'no', max_length=500, null=True),
        ),
    ]
