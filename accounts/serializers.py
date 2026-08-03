from rest_framework import serializers
from django.contrib.auth import authenticate
from accounts.models import CustomUser
import re
from datetime import timedelta
from django.utils import timezone

PSEUDO_PATTERN = re.compile(r'^[a-zA-Z0-9_]{3,20}$')
DELAI_CHANGEMENT_PSEUDO = timedelta(days=30)

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'pseudo','created_at',]
        read_only_fields = ['id', 'created_at']

class PrivateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 
                  'first_name', 
                  'last_name', 
                  'email_verified', 
                  'profile_visibility',
                  'created_at',
                  'id',
                  'pseudo',
                  'pseudo_updated_at',]
        read_only_fields = ['id', 
                            'created_at',
                            'email_verified',
                            'pseudo_updated_at',
                            'email',]
        
    def validate_pseudo(self, value):
        if value is None:
            return value
        
        if not PSEUDO_PATTERN.match(value):
            raise serializers.ValidationError(
                "3 à 20 caractères : lettres, chiffres ou tiret bas"
            )
            
        utilisateur = self.instance
        
        # self.instance est None quand le sérialiseur crée un objet, et porte
        # l'utilisateur quand il en modifie un. À l'inscription il n'y a pas d'ancien
        # pseudo, donc pas de délai à faire respecter.
        if utilisateur is None:
            return value

        # Le formulaire de profil renvoie tous ses champs, y compris ceux qui n'ont pas
        # bougé. Sans ce test, corriger son prénom bloquerait le pseudo pour 30 jours.
        if value == utilisateur.pseudo:
            return value

        # unique=True est sensible à la casse : "MaxLift" et "maxlift" cohabiteraient.
        # Comme le pseudo est l'identifiant public, on refuse les deux.
        # exclude(pk=...) sort l'utilisateur courant du lot, sinon il se bloquerait
        # lui-même en changeant juste la casse de son propre pseudo.
        if CustomUser.objects.filter(pseudo__iexact=value).exclude(pk=utilisateur.pk).exists():
            raise serializers.ValidationError("Ce pseudo est déjà pris.")

        # Aucune date enregistrée = le pseudo n'a jamais été changé depuis l'inscription.
        # Tu as décidé que ce premier changement est offert.
        if utilisateur.pseudo_updated_at is None:
            return value

        prochaine_ouverture = utilisateur.pseudo_updated_at + DELAI_CHANGEMENT_PSEUDO
        if timezone.now() < prochaine_ouverture:
            raise serializers.ValidationError(
                f"Pseudo modifiable une fois par mois. "
                f"Prochain changement possible le {prochaine_ouverture:%d/%m/%Y}."
            )

        return value
    
    def update(self, instance, validated_data):
        # La comparaison se fait AVANT super().update() : après cet appel,
        # instance.pseudo porte déjà la nouvelle valeur et la comparaison
        # renverrait toujours False.
        pseudo_change = (
            'pseudo' in validated_data
            and validated_data['pseudo'] != instance.pseudo
        )

        utilisateur = super().update(instance, validated_data)

        if pseudo_change:
            utilisateur.pseudo_updated_at = timezone.now()
            # update_fields limite l'UPDATE SQL à cette seule colonne.
            utilisateur.save(update_fields=['pseudo_updated_at'])

        return utilisateur
    
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "email",
            "password",
            'password_confirm',
            "pseudo",
        ]
    
    def validate_pseudo(self, value):
        # Mêmes deux règles qu'au changement de pseudo, sans la fenêtre des 30 jours :
        # à l'inscription il n'y a pas de pseudo précédent.
        if value is None:
            return value

        if not PSEUDO_PATTERN.match(value):
            raise serializers.ValidationError(
                "3 à 20 caractères : lettres, chiffres ou tiret bas."
            )

        # Pas d'exclude() ici, contrairement à PrivateUserSerializer : aucun utilisateur
        # n'existe encore, il n'y a personne à sortir du lot.
        if CustomUser.objects.filter(pseudo__iexact=value).exists():
            raise serializers.ValidationError("Ce pseudo est déjà pris.")

        return value

    def validate(self, attrs):
        if attrs['password'] == attrs['password_confirm']:
            return attrs
        else:
            raise serializers.ValidationError()

    def create(self, validated_data):
        password = validated_data.pop('password')
        password_confirm = validated_data.pop('password_confirm')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    # The validate method is where we check email and password.
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        
        # Use Django's authenticate function to check password
        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError('Invalid credentials')

        # If successful, add the user object to the validated data
        attrs['user'] = user 
        return attrs