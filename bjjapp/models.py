from django.db import models

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

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    actual_belt = models.CharField(max_length=10, choices = belt_choices, default='WHITE')
    updated_at = models.DateTimeField(auto_now=True)

