# Generated by Django 4.2.5 on 2023-10-18 10:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('training', '0003_rename_set_trainingset'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exercise',
            name='description',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]
