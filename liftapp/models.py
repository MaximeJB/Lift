from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    weight = models.DecimalField(max_digits=5, decimal_places=1, blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    belt_level = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)