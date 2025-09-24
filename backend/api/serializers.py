# backend/api/serializers.py
# KORRIGIERT: Alle Bild-Felder im SiteSettingsSerializer werden nun über eine explizite
# SerializerMethodField definiert, um die Übertragung der Bild-URL absolut zu garantieren.

from rest_framework import serializers
from django.utils import timezone
from .models import (
    User, DigitalLegacyItem, FinancialItem, InsuranceItem, ContractItem, 
    Document, LastWishes, MemorialPage, Condolence, TimelineEvent, 
    GalleryItem, MemorialCandle, ReleaseRequest, MemorialEvent, SiteSettings,
    CondolenceTemplate, CandleImage, CandleMessageTemplate, MediaAsset, EventLocation,
    EventAttendance, FamilyLink, TrauerdruckType, TrauerdruckEntwurf, TrauerdruckDesign,
    TrauerdruckKommentar, TrauerdruckFreigabe, TrauerdruckDesignFreigabe, TrauerdruckBenachrichtigung, 
    TrauerdruckTemplate
)
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.ReadOnlyField()

    class Meta:
        model = MediaAsset
        fields = ('title', 'url', 'asset_type')

class MemorialPageListSerializer(serializers.ModelSerializer):
    main_photo = MediaAssetSerializer(read_only=True)

    class Meta:
        model = MemorialPage
        fields = [
            'slug', 'first_name', 'last_name', 
            'date_of_birth', 'date_of_death', 'main_photo'
        ]

class EventLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventLocation
        fields = ['name', 'address']

class CandleImageSerializer(serializers.ModelSerializer):
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


# ===== TRAUERDRUCK-SERIALIZER =====

class TrauerdruckTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrauerdruckType
        fields = ['id', 'name', 'description', 'is_active', 'created_at']


class TrauerdruckDesignSerializer(serializers.ModelSerializer):
    design_file_url = serializers.SerializerMethodField()
    preview_file_url = serializers.SerializerMethodField()
    approval_count = serializers.SerializerMethodField()
    rejection_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrauerdruckDesign
        fields = [
            'id', 'entwurf', 'title', 'description', 'design_file', 'design_file_url',
            'preview_file', 'preview_file_url', 'is_active', 'is_approved', 'order',
            'approval_count', 'rejection_count', 'created_at', 'updated_at'
        ]
    
    def get_design_file_url(self, obj):
        return obj.design_file.url if obj.design_file else None
    
    def get_preview_file_url(self, obj):
        return obj.preview_file.url if obj.preview_file else None
    
    def get_approval_count(self, obj):
        return obj.freigaben.filter(decision='approved').count()
    
    def get_rejection_count(self, obj):
        return obj.freigaben.filter(decision='rejected').count()


class TrauerdruckEntwurfSerializer(serializers.ModelSerializer):
    memorial_page_name = serializers.CharField(source='memorial_page.deceased_name', read_only=True)
    trauerdruck_type_name = serializers.CharField(source='trauerdruck_type.name', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    assigned_to_names = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    designs = TrauerdruckDesignSerializer(many=True, read_only=True)
    
    class Meta:
        model = TrauerdruckEntwurf
        fields = [
            'id', 'title', 'description', 'trauerdruck_type', 'trauerdruck_type_name',
            'memorial_page', 'memorial_page_name', 'status', 'status_display',
            'version', 'is_latest_version', 'created_by', 'created_by_name',
            'assigned_to', 'assigned_to_names', 'created_at', 'updated_at',
            'deadline', 'priority', 'priority_display', 'designs'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_created_by_name(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}" if obj.created_by else ""
    
    def get_assigned_to_names(self, obj):
        return [f"{user.first_name} {user.last_name}" for user in obj.assigned_to.all()]


class TrauerdruckKommentarSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TrauerdruckKommentar
        fields = ['id', 'entwurf', 'author', 'author_name', 'content', 'is_internal', 'created_at']
        read_only_fields = ['author', 'created_at']
    
    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}" if obj.author else ""


class TrauerdruckFreigabeSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    decision_display = serializers.CharField(source='get_decision_display', read_only=True)
    
    class Meta:
        model = TrauerdruckFreigabe
        fields = [
            'id', 'entwurf', 'reviewer', 'reviewer_name', 'decision', 'decision_display',
            'comment', 'revision_notes', 'created_at'
        ]
        read_only_fields = ['reviewer', 'created_at']
    
    def get_reviewer_name(self, obj):
        return f"{obj.reviewer.first_name} {obj.reviewer.last_name}" if obj.reviewer else ""


class TrauerdruckDesignFreigabeSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    decision_display = serializers.CharField(source='get_decision_display', read_only=True)
    
    class Meta:
        model = TrauerdruckDesignFreigabe
        fields = [
            'id', 'design', 'reviewer', 'reviewer_name', 'decision', 'decision_display',
            'comment', 'created_at'
        ]
        read_only_fields = ['reviewer', 'created_at']
    
    def get_reviewer_name(self, obj):
        return f"{obj.reviewer.first_name} {obj.reviewer.last_name}" if obj.reviewer else ""


class TrauerdruckBenachrichtigungSerializer(serializers.ModelSerializer):
    entwurf_title = serializers.CharField(source='entwurf.title', read_only=True)
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = TrauerdruckBenachrichtigung
        fields = [
            'id', 'user', 'entwurf', 'entwurf_title', 'notification_type', 
            'notification_type_display', 'title', 'message', 'is_read', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']


class TrauerdruckTemplateSerializer(serializers.ModelSerializer):
    trauerdruck_type_name = serializers.CharField(source='trauerdruck_type.name', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    template_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TrauerdruckTemplate
        fields = [
            'id', 'name', 'description', 'trauerdruck_type', 'trauerdruck_type_name',
            'template_file', 'template_file_url', 'is_active', 'created_by', 
            'created_by_name', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']
    
    def get_created_by_name(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}" if obj.created_by else ""
    
    def get_template_file_url(self, obj):
        return obj.template_file.url if obj.template_file else None

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

class SiteSettingsSerializer(serializers.ModelSerializer):
    header_logo_image = MediaAssetSerializer(read_only=True)
    listing_background_image = MediaAssetSerializer(read_only=True)
    search_background_image = MediaAssetSerializer(read_only=True)
    expend_background_image = MediaAssetSerializer(read_only=True)
    login_background_image = MediaAssetSerializer(read_only=True)
    register_background_image = MediaAssetSerializer(read_only=True)
    register_info_panel_image = MediaAssetSerializer(read_only=True)
    password_reset_background_image = MediaAssetSerializer(read_only=True)
    mein_bereich_background_image = MediaAssetSerializer(read_only=True)
    portal_choice_background_image = MediaAssetSerializer(read_only=True)
    gedenken_card_image = MediaAssetSerializer(read_only=True)
    vorsorge_card_image = MediaAssetSerializer(read_only=True)
    unterlagen_card_image = MediaAssetSerializer(read_only=True)

    class Meta:
        model = SiteSettings
        # Explizite Auflistung aller Felder, um die SerializerMethodFields einzuschließen
        fields = [
            # Header
            'header_logo_image', 'header_logo_height', 'header_site_title_text', 
            'header_site_title_color', 'header_site_title_size', 'header_button_text_size',
            # Portal Choice
            'portal_choice_title', 'portal_choice_title_color', 'portal_choice_subtitle', 
            'portal_choice_subtitle_color', 'portal_choice_background_color', 
            'portal_choice_background_image',
            # Gedenken Column
            'gedenken_card_sidetext', 'gedenken_card_sidetext_color', 'gedenken_card_sidetext_size',
            'gedenken_card_background_color', 'gedenken_card_image', 'gedenken_card_title',
            'gedenken_card_title_color', 'gedenken_card_title_size', 'gedenken_card_details_text',
            'gedenken_card_details_text_color', 'gedenken_card_details_text_size', 
            'gedenken_card_content_background', 'gedenken_card_slide_transparency',
            # Vorsorge Column
            'vorsorge_card_sidetext', 'vorsorge_card_sidetext_color', 'vorsorge_card_sidetext_size',
            'vorsorge_card_background_color', 'vorsorge_card_image', 'vorsorge_card_title',
            'vorsorge_card_title_color', 'vorsorge_card_title_size', 'vorsorge_card_details_text',
            'vorsorge_card_details_text_color', 'vorsorge_card_details_text_size', 
            'vorsorge_card_content_background', 'vorsorge_card_slide_transparency',
            # Unterlagen Column
            'unterlagen_card_sidetext', 'unterlagen_card_sidetext_color', 'unterlagen_card_sidetext_size',
            'unterlagen_card_background_color', 'unterlagen_card_image', 'unterlagen_card_title',
            'unterlagen_card_title_color', 'unterlagen_card_title_size', 'unterlagen_card_details_text',
            'unterlagen_card_details_text_color', 'unterlagen_card_details_text_size', 
            'unterlagen_card_content_background', 'unterlagen_card_slide_transparency',
            # Restliche Felder
            'listing_title', 'listing_background_color', 'listing_background_image', 
            'listing_card_color', 'listing_text_color', 'listing_card_text_color', 
            'listing_arrow_color', 'search_title', 'search_helper_text', 
            'search_background_color', 'search_background_image', 'search_text_color',
            'search_filter_button_color', 'search_filter_button_icon_color', 
            'search_filter_menu_color', 'search_filter_menu_text_color', 
            'search_filter_active_color', 'search_filter_active_text_color',
            'expend_background_color', 'expend_background_image', 'expend_card_color', 
            'expend_text_color', 'font_family', 'font_size_base', 'login_title', 
            'login_subtitle', 'login_background_color', 'login_background_image',
            'login_card_background_color', 'login_text_color', 'login_button_color', 
            'login_button_text_color', 'register_title', 'register_subtitle',
            'register_background_color', 'register_background_image', 
            'register_info_panel_image', 'register_info_panel_image_size',
            'register_card_background_color', 'register_text_color', 
            'register_button_color', 'register_button_text_color',
            'password_reset_title', 'password_reset_subtitle', 
            'password_reset_background_color', 'password_reset_background_image',
            'password_reset_card_background_color', 'password_reset_text_color',
            'password_reset_button_color', 'password_reset_button_text_color',
            'password_reset_confirm_title', 'password_reset_confirm_subtitle',
            'mein_bereich_background_color', 'mein_bereich_background_image',
            'mein_bereich_container_background_color', 'mein_bereich_sidebar_background_color',
            'mein_bereich_sidebar_text_color', 'mein_bereich_sidebar_active_background_color',
            'mein_bereich_sidebar_active_text_color', 'mein_bereich_dashboard_title',
            'mein_bereich_dashboard_subtitle'
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

class ManagedGedenkseiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemorialPage
        fields = ['slug', 'first_name', 'last_name']

class FamilyLinkSerializer(serializers.ModelSerializer):
    deceased_user_name = serializers.SerializerMethodField()
    relative_user_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    permission_level_display = serializers.CharField(source='get_permission_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    validated_by_name = serializers.SerializerMethodField()
    can_access_memorial = serializers.SerializerMethodField()
    can_access_precaution = serializers.SerializerMethodField()
    
    class Meta:
        model = FamilyLink
        fields = [
            'id', 'deceased_user', 'deceased_user_name', 'relative_user', 'relative_user_name',
            'role', 'role_display', 'permission_level', 'permission_level_display',
            'status', 'status_display', 'relationship', 'is_validated_by_admin', 
            'validated_at', 'validated_by', 'validated_by_name', 'created_at', 'updated_at',
            'created_by', 'created_by_name', 'notes', 'access_count', 'last_accessed',
            'last_ip_address', 'can_access_memorial', 'can_access_precaution'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'validated_at', 'access_count', 'last_accessed', 'last_ip_address']
    
    def get_deceased_user_name(self, obj):
        return obj.deceased_user.get_full_name() if obj.deceased_user else ""
    
    def get_relative_user_name(self, obj):
        return obj.relative_user.get_full_name() if obj.relative_user else ""
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else ""
    
    def get_validated_by_name(self, obj):
        return obj.validated_by.get_full_name() if obj.validated_by else ""
    
    def get_can_access_memorial(self, obj):
        return obj.can_access_memorial()
    
    def get_can_access_precaution(self, obj):
        return obj.can_access_precaution_data()

class MeinBereichDataSerializer(serializers.Serializer):
    own_page = ManagedGedenkseiteSerializer(read_only=True)
    managed_pages = ManagedGedenkseiteSerializer(many=True, read_only=True)

