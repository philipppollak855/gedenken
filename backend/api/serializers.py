# backend/api/serializers.py
# FINALE VERSION: Kombiniert den vollständigen Originalcode mit dem zentralen MediaAssetSerializer.

from rest_framework import serializers
from django.utils import timezone
from .models import (
    User, DigitalLegacyItem, FinancialItem, InsuranceItem, ContractItem, 
    Document, LastWishes, MemorialPage, Condolence, TimelineEvent, 
    GalleryItem, MemorialCandle, ReleaseRequest, MemorialEvent, SiteSettings,
    CondolenceTemplate, CandleImage, CandleMessageTemplate, MediaAsset, EventLocation,
    EventAttendance, MediaFolder
)
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# --- Zentraler Serializer für Mediendateien ---
# Stellt sicher, dass immer die vollständige URL zurückgegeben wird.
class MediaAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = ('title', 'url', 'asset_type')

# --- Stammdaten & Vorlagen Serializers ---

class EventLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventLocation
        fields = ['name', 'address']

class CandleImageSerializer(serializers.ModelSerializer):
    # Verwendung des zentralen MediaAssetSerializers
    image = MediaAssetSerializer(read_only=True)
    class Meta:
        model = CandleImage
        fields = ['id', 'name', 'image', 'type']

class CandleMessageTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandleMessageTemplate
        fields = ['title', 'text']

class CondolenceTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CondolenceTemplate
        fields = ['title', 'text']

# --- Benutzer & Authentifizierung Serializers ---

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password2', 'consent_admin_access']
        extra_kwargs = {'password': {'write_only': True}, 'consent_admin_access': {'required': True}}
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwörter stimmen nicht überein."})
        if not attrs['consent_admin_access']:
            raise serializers.ValidationError({"consent_admin_access": "Die Zustimmung ist erforderlich."})
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'], 
            first_name=validated_data.get('first_name', ''), 
            last_name=validated_data.get('last_name', ''), 
            password=validated_data['password'], 
            consent_admin_access=validated_data['consent_admin_access']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'profile_completeness']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['role'] = user.role
        return token

# --- Vorsorge Serializers ---

class DigitalLegacyItemSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = DigitalLegacyItem
        fields = ['item_id', 'user', 'category', 'provider', 'username_email', 'password_hint', 'instruction', 'notes', 'created_at']
        read_only_fields = ['user', 'item_id', 'created_at']

class FinancialItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialItem
        fields = '__all__'
        read_only_fields = ['user', 'item_id', 'created_at']

class InsuranceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceItem
        fields = '__all__'
        read_only_fields = ['user', 'item_id', 'created_at']

class ContractItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractItem
        fields = '__all__'
        read_only_fields = ['user', 'item_id', 'created_at']

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['user', 'doc_id', 'uploaded_at']

class LastWishesSerializer(serializers.ModelSerializer):
    class Meta:
        model = LastWishes
        fields = '__all__'
        read_only_fields = ['user', 'updated_at']

# --- Gedenkseiten-Inhalt Serializers ---

class CondolenceSerializer(serializers.ModelSerializer):
    is_owner = serializers.SerializerMethodField()
    page_slug = serializers.ReadOnlyField(source='page.slug')

    class Meta:
        model = Condolence
        fields = ['condolence_id', 'guest_name', 'message', 'created_at', 'author', 'is_owner', 'page_slug']
        read_only_fields = ['author']

    def get_is_owner(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False

class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = ['event_id', 'date', 'title', 'description', 'image_url']

class GalleryItemSerializer(serializers.ModelSerializer):
    image = MediaAssetSerializer(read_only=True)
    class Meta:
        model = GalleryItem
        fields = ['item_id', 'image', 'caption']

class MemorialCandleSerializer(serializers.ModelSerializer):
    is_owner = serializers.SerializerMethodField()
    page_slug = serializers.ReadOnlyField(source='page.slug')
    candle_image = CandleImageSerializer(read_only=True)
    candle_image_id = serializers.PrimaryKeyRelatedField(
        queryset=CandleImage.objects.all(), source='candle_image', write_only=True
    )

    class Meta:
        model = MemorialCandle
        fields = [
            'candle_id', 'guest_name', 'message', 'is_private', 'created_at', 
            'author', 'is_owner', 'page_slug', 
            'candle_image', 'candle_image_id'
        ]
        read_only_fields = ['author']
    
    def get_is_owner(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False

class EventAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventAttendance
        fields = ['guest_name']

class MemorialEventSerializer(serializers.ModelSerializer):
    location = EventLocationSerializer(read_only=True)
    class Meta:
        model = MemorialEvent
        exclude = ['page']

# --- Gedenkseiten & Globale Einstellungen Serializers ---

class MemorialPageListSerializer(serializers.ModelSerializer):
    main_photo = MediaAssetSerializer(read_only=True)

    class Meta:
        model = MemorialPage
        fields = [
            'slug', 'first_name', 'last_name', 
            'date_of_birth', 'date_of_death', 'main_photo'
        ]

class SiteSettingsSerializer(serializers.ModelSerializer):
    listing_background_image = MediaAssetSerializer(read_only=True)
    search_background_image = MediaAssetSerializer(read_only=True)
    expend_background_image = MediaAssetSerializer(read_only=True)

    class Meta:
        model = SiteSettings
        fields = [
            'listing_title', 'listing_background_color', 'listing_card_color', 'listing_text_color', 'listing_arrow_color',
            'search_title', 'search_helper_text', 'search_background_color', 'search_text_color',
            'expend_background_color', 'expend_card_color', 'expend_text_color',
            'listing_background_image', 'search_background_image', 'expend_background_image'
        ]

class MemorialPageSerializer(serializers.ModelSerializer):
    main_photo = MediaAssetSerializer(read_only=True)
    hero_background_image = MediaAssetSerializer(read_only=True)
    farewell_background_image = MediaAssetSerializer(read_only=True)
    obituary_card_image = MediaAssetSerializer(read_only=True)
    memorial_picture = MediaAssetSerializer(read_only=True)
    memorial_picture_back = MediaAssetSerializer(read_only=True)
    acknowledgement_image = MediaAssetSerializer(read_only=True)
    
    condolences = CondolenceSerializer(many=True, read_only=True)
    timeline_events = TimelineEventSerializer(many=True, read_only=True)
    gallery_items = GalleryItemSerializer(many=True, read_only=True)
    candles = MemorialCandleSerializer(many=True, read_only=True)
    candle_count = serializers.SerializerMethodField()
    condolence_count = serializers.SerializerMethodField()
    events = MemorialEventSerializer(many=True, read_only=True)

    class Meta:
        model = MemorialPage
        fields = [
            'user', 'slug', 'status', 'first_name', 'last_name', 'birth_name_type', 'birth_name_or_title', 
            'date_of_birth', 'date_of_death', 
            'hero_background_size', 'obituary', 'condolences',
            'timeline_events', 'gallery_items', 
            'donation_text', 'donation_link', 'donation_bank_details',
            'candles', 'candle_count', 'condolence_count',
            'events', 'cemetery',
            'farewell_background_color', 'farewell_background_size', 'farewell_text_inverted',
            'show_memorial_picture', 
            'acknowledgement_type', 'acknowledgement_text', 
            'condolence_moderation',
            'main_photo', 'hero_background_image', 'farewell_background_image',
            'obituary_card_image', 'memorial_picture', 'memorial_picture_back',
            'acknowledgement_image'
        ]
    
    def get_candle_count(self, obj):
        return obj.candles.count()
    
    def get_condolence_count(self, obj):
        return obj.condolences.filter(is_approved=True).count()

# --- Freigabe-Prozess Serializer ---

class ReleaseRequestSerializer(serializers.ModelSerializer):
    reporter_password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    class Meta:
        model = ReleaseRequest
        fields = [
            'request_id', 'deceased_first_name', 'deceased_last_name', 
            'deceased_date_of_birth', 'deceased_date_of_death',
            'reporter_name', 'reporter_email', 'reporter_password', 'reporter_password2',
            'reporter_relationship', 'death_certificate'
        ]
        extra_kwargs = {'reporter_password': {'write_only': True}}
        
    def validate(self, attrs):
        if attrs['reporter_password'] != attrs['reporter_password2']:
            raise serializers.ValidationError({"password": "Passwörter stimmen nicht überein."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('reporter_password2')
        return ReleaseRequest.objects.create(**validated_data)

