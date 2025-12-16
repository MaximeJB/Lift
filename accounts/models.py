import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    profile_visibility_choices = [
    ("PUBLIC", "Public"),
    ("PRIVATE", "Private")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pseudo = models.CharField(max_length=100, blank=True, null=True,unique=True)
    email = models.EmailField(unique=True, blank=False, null=False)
    email_verified = models.BooleanField(default=False)
    profile_visibility = models.CharField(max_length=10, choices = profile_visibility_choices, default='PUBLIC')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['email']


    def __str__(self):
        return f"{self.pseudo}, {self.email}"