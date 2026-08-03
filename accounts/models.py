import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.forms.fields import DateTimeField

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None):
        user = self.create_user(email, password=password)
        user.is_admin= True
        user.save(using=self._db)
        return user
    
class CustomUser(AbstractUser):
    profile_visibility_choices = [
    ("PUBLIC", "Public"),
    ("PRIVATE", "Private")]
    
    objects = CustomUserManager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pseudo = models.CharField(max_length=100, blank=True, null=True,unique=True)
    pseudo_updated_at = models.DateTimeField(null=True, blank=True)
    email = models.EmailField(unique=True, blank=False, null=False)
    email_verified = models.BooleanField(default=False)
    profile_visibility = models.CharField(max_length=10, choices = profile_visibility_choices, default='PUBLIC')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    def __str__(self):
        return f"{self.pseudo}, {self.email}"
    
    def can_change_pseudo():
        pass