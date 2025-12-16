from django.db import models
import uuid

from accounts.models import CustomUser



class BeltPromotion(models.Model):
    belt_choices = [
    ("WHITE", "Public"),
    ("YELLOW", "Yellow"),
    ("ORANGE", "Orange"),
    ("BLUE", "Blue"),
    ("PURPLE", "Purple"),
    ("BROWN", "Brown"),
    ("Black", "Black")]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    promotion_date = models.CharField(max_length=100, blank=True, null=True)
    academy = models.CharField(max_length=300, blank=True, null=True)
    notes = models.CharField(max_length=600, blank=True, null=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    actual_belt = models.CharField(max_length=10, choices = belt_choices, default='WHITE')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    synced_at = models.DateTimeField(null=True, blank=True)

