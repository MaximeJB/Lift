import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

from accounts.models import CustomUser


class WeightLog(models.Model):
    actual_weight = models.DecimalField(max_digits=5, decimal_places=2,
    null=False,
    blank=False,
    default=0,
    verbose_name="Put your actual weight",
    validators=[
        MinValueValidator(0),
        MaxValueValidator(200)])
    logged_at = models.DateTimeField(default= timezone.now)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    


    