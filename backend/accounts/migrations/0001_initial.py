# Generated by Django 5.0 on 2024-11-30 08:59

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('can_open', models.BooleanField(default=False)),
                ('can_close_cleaning', models.BooleanField(default=False)),
                ('can_close_cashier', models.BooleanField(default=False)),
                ('can_close_floor', models.BooleanField(default=False)),
                ('can_order', models.BooleanField(default=False)),
                ('is_beginner', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]