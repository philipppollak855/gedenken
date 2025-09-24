# backend/api/views.py
# HINWEIS: Ihr Originalcode wurde als Basis verwendet. Es waren keine logischen Änderungen nötig.
# Lediglich Umlaute und Formatierung wurden zur Konsistenz korrigiert.

import os
import json
from datetime import timedelta
from django.core.management import call_command
from django.urls import reverse
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.hashers import make_password
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


from .serializers import (
    RegisterSerializer, UserSerializer, DigitalLegacyItemSerializer,
    FinancialItemSerializer, InsuranceItemSerializer, ContractItemSerializer,
    DocumentSerializer, LastWishesSerializer, MemorialPageSerializer, 
    CondolenceSerializer, MemorialCandleSerializer, TimelineEventSerializer, 
    GalleryItemSerializer, ReleaseRequestSerializer,
    MemorialPageListSerializer, SiteSettingsSerializer, CondolenceTemplateSerializer,
    CandleImageSerializer, CandleMessageTemplateSerializer, EventAttendanceSerializer,
    MemorialEventSerializer, MeinBereichDataSerializer, FamilyLinkSerializer,
    TrauerdruckTypeSerializer, TrauerdruckEntwurfSerializer, TrauerdruckDesignSerializer, TrauerdruckKommentarSerializer,
    TrauerdruckFreigabeSerializer, TrauerdruckDesignFreigabeSerializer, TrauerdruckBenachrichtigungSerializer, TrauerdruckTemplateSerializer,
    # Bestattungsvorsorge Serializer
    BestattungsartSerializer, VerabschiedungsartSerializer, MusikKategorieSerializer, VereinsKategorieSerializer,
    GrabartSerializer, DokumentKategorieSerializer, DigitalerNachlassKategorieSerializer,
    BestattungsvorsorgeSerializer, BestattungsvorsorgeDokumentSerializer, DigitalerNachlassSerializer
)
from .models import (
    User, DigitalLegacyItem, FinancialItem, InsuranceItem, ContractItem, 
    Document, LastWishes, MemorialPage, Condolence, MemorialCandle,
    TimelineEvent, GalleryItem, ReleaseRequest, SiteSettings, CondolenceTemplate,
    CandleImage, CandleMessageTemplate, EventLocation, MemorialEvent, EventAttendance,
    FamilyLink, TrauerdruckType, TrauerdruckEntwurf, TrauerdruckDesign, TrauerdruckKommentar,
    TrauerdruckFreigabe, TrauerdruckDesignFreigabe, TrauerdruckBenachrichtigung, TrauerdruckTemplate,
    # Bestattungsvorsorge Modelle
    Bestattungsart, Verabschiedungsart, MusikKategorie, VereinsKategorie, Grabart,
    DokumentKategorie, DigitalerNachlassKategorie, Bestattungsvorsorge,
    BestattungsvorsorgeDokument, DigitalerNachlass
)
from .services import TrauerdruckNotificationService, TrauerdruckWorkflowService


def get_consistent_familylink_sql(where_clause="", order_by="COALESCE(fl.created_at, fl.link_id) DESC"):
    """
    Zentrale Hilfsfunktion für konsistente FamilyLink-SQL-Queries
    """
    return f"""
        SELECT COALESCE(fl.id, fl.link_id) as id, 
               COALESCE(fl.relationship, '') as relationship,
               COALESCE(fl.role, 'family_member') as role,
               COALESCE(fl.permission_level, 'view_only') as permission_level,
               COALESCE(fl.is_active, true) as is_active, 
               COALESCE(fl.is_validated_by_admin, false) as is_validated_by_admin, 
               fl.validated_at,
               fl.created_at, fl.updated_at, 
               COALESCE(fl.notes, '') as notes,
               fl.deceased_user_id, fl.relative_user_id, 
               fl.validated_by_id, fl.created_by_id
        FROM api_familylink fl
        {where_clause}
        ORDER BY {order_by}
    """

def get_family_links_for_user(user, permission_level=None, is_validated=None):
    """
    DEPRECATED: Verwende get_active_family_links_for_user aus services.py
    Hilfsfunktion für FamilyLink-Queries mit Datenbank-Kompatibilität
    """
    try:
        # Neue konsistente FamilyLink-Integration
        queryset = FamilyLink.objects.filter(
            relative_user=user,
            status=FamilyLink.Status.ACTIVE,
            is_validated_by_admin=True
        )
        if permission_level:
            queryset = queryset.filter(permission_level=permission_level)
        if is_validated is not None:
            queryset = queryset.filter(is_validated_by_admin=is_validated)
        return queryset
    except Exception as e:
        # Fallback: Verwende Raw SQL wenn Django ORM fehlschlägt
        if "column api_familylink.id does not exist" in str(e):
            from django.db import connection
            with connection.cursor() as cursor:
                # Prüfe welche Spalten existieren
                cursor.execute("""
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_name = 'api_familylink' AND table_schema = 'public'
                """)
                existing_columns = [row[0] for row in cursor.fetchall()]
                
                # Verwende zentrale Hilfsfunktion für konsistente SQL-Query
                cursor.execute(get_consistent_familylink_sql("WHERE fl.relative_user_id = %s"), [user.id])
                
                # Erstelle Mock-Objekte für die Views
                class MockFamilyLink:
                    def __init__(self, row):
                        self.id = row[0]
                        self.relationship = row[1] or ''
                        self.role = row[2] or 'family_member'
                        self.permission_level = row[3] or 'view_only'
                        self.is_active = row[4] if row[4] is not None else True
                        self.is_validated_by_admin = row[5] if row[5] is not None else False
                        self.validated_at = row[6]
                        self.created_at = row[7]
                        self.updated_at = row[8]
                        self.notes = row[9] or ''
                        
                        # Mock User-Objekte
                        self.deceased_user = type('User', (), {
                            'id': row[10],
                            'pk': row[10]
                        })()
                        
                        self.relative_user = user
                
                rows = cursor.fetchall()
                mock_objects = [MockFamilyLink(row) for row in rows]
                
                # Filtere basierend auf permission_level und is_validated
                if permission_level:
                    mock_objects = [obj for obj in mock_objects if obj.permission_level == permission_level]
                if is_validated is not None:
                    mock_objects = [obj for obj in mock_objects if obj.is_validated_by_admin == is_validated]
                
                # Erstelle eine Mock-QuerySet
                class MockQuerySet:
                    def __init__(self, objects):
                        self.objects = objects
                    
                    def __iter__(self):
                        return iter(self.objects)
                    
                    def __len__(self):
                        return len(self.objects)
                    
                    def __getitem__(self, key):
                        return self.objects[key]
                    
                    def count(self):
                        return len(self.objects)
                    
                    def exists(self):
                        return len(self.objects) > 0
                    
                    def values_list(self, field, flat=False):
                        if field == 'deceased_user_id':
                            return [obj.deceased_user.id for obj in self.objects]
                        return []
                    
                    def none(self):
                        return MockQuerySet([])
                
                return MockQuerySet(mock_objects)
        else:
            # Andere Fehler: Leere QuerySet zurückgeben
            return FamilyLink.objects.none()

class GlobalSearchView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', None)
        results = []
        if query and len(query) > 2:
            try:
                users = User.objects.filter(
                    Q(first_name__icontains=query) |
                    Q(last_name__icontains=query) |
                    Q(email__icontains=query)
                )[:10]
                for user in users:
                    results.append({
                        'type': 'Benutzer',
                        'title': f"{user.first_name} {user.last_name} ({user.email})",
                        'url': reverse('admin:api_user_change', args=[user.pk])
                    })
            except Exception as e:
                print(f"Fehler bei der Benutzersuche: {e}")
            try:
                pages = MemorialPage.objects.filter(
                    Q(first_name__icontains=query) |
                    Q(last_name__icontains=query)
                )[:10]
                for page in pages:
                    results.append({
                        'type': 'Gedenkseite',
                        'title': f"Gedenkseite für {page.first_name} {page.last_name}",
                        'url': reverse('admin:api_memorialpage_change', args=[page.pk])
                    })
            except Exception as e:
                print(f"Fehler bei der Gedenkseitensuche: {e}")
            try:
                condolences = Condolence.objects.filter(
                    Q(guest_name__icontains=query) |
                    Q(message__icontains=query)
                ).select_related('page')[:10]
                for condolence in condolences:
                    results.append({
                        'type': 'Kondolenz',
                        'title': f"'{condolence.message[:30]}...' von {condolence.guest_name} für {condolence.page}",
                        'url': reverse('admin:api_condolence_change', args=[condolence.condolence_id])
                    })
            except Exception as e:
                print(f"Fehler bei der Kondolenzsuche: {e}")
            try:
                candles = MemorialCandle.objects.filter(
                    Q(guest_name__icontains=query) |
                    Q(message__icontains=query)
                ).select_related('page')[:10]
                for candle in candles:
                    results.append({
                        'type': 'Gedenkkerze',
                        'title': f"'{candle.message[:30]}...' von {candle.guest_name} für {candle.page}",
                        'url': reverse('admin:api_memorialcandle_change', args=[candle.candle_id])
                    })
            except Exception as e:
                print(f"Fehler bei der Kerzensuche: {e}")

        return Response(results)

class AllowGuestPostIsOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

class SeedDatabaseView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, key):
        SECRET_KEY = os.environ.get('SEED_SECRET_KEY')
        if not SECRET_KEY:
            return Response({"error": "Secret key for seeding is not configured on the server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        if key != SECRET_KEY:
            return Response({"error": "Invalid secret key."}, status=status.HTTP_403_FORBIDDEN)
        try:
            print('Starting database seeding via API...')
            call_command('seed_data')
            print('Database seeding finished.')
            return Response({"message": "Database seeding initiated successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"An error occurred during seeding: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'status': 'ok'}, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        frontend_url = 'https://gedenken.netlify.app'
        reset_link = f"{frontend_url}/password-reset-confirm/{uid}/{token}/"

        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("PASSWORT-RESET-LINK (normalerweise per E-Mail gesendet):")
        print(reset_link)
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

        return Response({'status': 'ok'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')
        password2 = request.data.get('password2')

        if not all([uidb64, token, password, password2]):
            return Response({'error': 'Alle Felder sind erforderlich.'}, status=status.HTTP_400_BAD_REQUEST)

        if password != password2:
            return Response({'error': 'Passwörter stimmen nicht überein.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            try:
                validate_password(password, user)
            except ValidationError as e:
                return Response({'errors': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(password)
            user.save()
            return Response({'status': 'Passwort erfolgreich zurückgesetzt.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Ungültiger Link.'}, status=status.HTTP_400_BAD_REQUEST)

class CandleImageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CandleImage.objects.all()
    serializer_class = CandleImageSerializer
    permission_classes = [permissions.AllowAny]

class CandleMessageTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CandleMessageTemplate.objects.all()
    serializer_class = CandleMessageTemplateSerializer
    permission_classes = [permissions.AllowAny]

class CondolenceTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CondolenceTemplate.objects.all()
    serializer_class = CondolenceTemplateSerializer
    permission_classes = [permissions.AllowAny]

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class CanViewVorsorgeDataPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated: return False
        if user.is_staff or obj.user == user: return True
        
        # Neue konsistente FamilyLink-Berechtigung
        return FamilyLink.objects.filter(
            deceased_user=obj.user, 
            relative_user=user,
            status=FamilyLink.Status.ACTIVE,
            permission_level__in=[
                FamilyLink.PermissionLevel.MANAGE_ALL,
                FamilyLink.PermissionLevel.ADMIN_LEVEL
            ],
            is_validated_by_admin=True
        ).exists()

class CanEditVorsorgeDataPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated: return False
        if user.is_staff or obj.user == user: return True
        
        # Neue konsistente FamilyLink-Berechtigung
        return FamilyLink.objects.filter(
            deceased_user=obj.user, 
            relative_user=user,
            status=FamilyLink.Status.ACTIVE,
            permission_level__in=[
                FamilyLink.PermissionLevel.MANAGE_ALL,
                FamilyLink.PermissionLevel.ADMIN_LEVEL
            ],
            is_validated_by_admin=True
        ).exists()

class CanEditMemorialPagePermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated: return False
        if user.is_staff or obj.user == user: return True
        
        # Neue konsistente FamilyLink-Berechtigung
        return FamilyLink.objects.filter(
            deceased_user=obj.user, 
            relative_user=user,
            status=FamilyLink.Status.ACTIVE,
            permission_level__in=[
                FamilyLink.PermissionLevel.EDIT_MEMORIAL, 
                FamilyLink.PermissionLevel.MANAGE_ALL,
                FamilyLink.PermissionLevel.ADMIN_LEVEL
            ],
            is_validated_by_admin=True
        ).exists()

class DigitalLegacyItemViewSet(viewsets.ModelViewSet):
    serializer_class = DigitalLegacyItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        # Neue konsistente FamilyLink-Integration
        linked_deceased_ids = FamilyLink.objects.filter(
            relative_user=user,
            status=FamilyLink.Status.ACTIVE,
            permission_level__in=[
                FamilyLink.PermissionLevel.MANAGE_ALL,
                FamilyLink.PermissionLevel.ADMIN_LEVEL
            ],
            is_validated_by_admin=True
        ).values_list('deceased_user_id', flat=True)
        return DigitalLegacyItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class FinancialItemViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        # Neue konsistente FamilyLink-Integration
        linked_deceased_ids = FamilyLink.objects.filter(
            relative_user=user,
            status=FamilyLink.Status.ACTIVE,
            permission_level__in=[
                FamilyLink.PermissionLevel.MANAGE_ALL,
                FamilyLink.PermissionLevel.ADMIN_LEVEL
            ],
            is_validated_by_admin=True
        ).values_list('deceased_user_id', flat=True)
        return FinancialItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class InsuranceItemViewSet(viewsets.ModelViewSet):
    serializer_class = InsuranceItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        # Neue konsistente FamilyLink-Integration
        linked_deceased_ids = FamilyLink.objects.filter(
            relative_user=user,
            status=FamilyLink.Status.ACTIVE,
            permission_level__in=[
                FamilyLink.PermissionLevel.MANAGE_ALL,
                FamilyLink.PermissionLevel.ADMIN_LEVEL
            ],
            is_validated_by_admin=True
        ).values_list('deceased_user_id', flat=True)
        return InsuranceItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class ContractItemViewSet(viewsets.ModelViewSet):
    serializer_class = ContractItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        # Neue konsistente FamilyLink-Integration
        linked_deceased_ids = FamilyLink.objects.filter(
            relative_user=user,
            status=FamilyLink.Status.ACTIVE,
            permission_level__in=[
                FamilyLink.PermissionLevel.MANAGE_ALL,
                FamilyLink.PermissionLevel.ADMIN_LEVEL
            ],
            is_validated_by_admin=True
        ).values_list('deceased_user_id', flat=True)
        return ContractItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    parser_classes = [MultiPartParser, FormParser]
    def get_queryset(self):
        user = self.request.user
        # Neue konsistente FamilyLink-Integration
        linked_deceased_ids = FamilyLink.objects.filter(
            relative_user=user,
            status=FamilyLink.Status.ACTIVE,
            permission_level__in=[
                FamilyLink.PermissionLevel.MANAGE_ALL,
                FamilyLink.PermissionLevel.ADMIN_LEVEL
            ],
            is_validated_by_admin=True
        ).values_list('deceased_user_id', flat=True)
        return Document.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class LastWishesView(generics.RetrieveUpdateAPIView):
    serializer_class = LastWishesSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_object(self):
        obj, created = LastWishes.objects.get_or_create(user=self.request.user)
        self.check_object_permissions(self.request, obj)
        return obj

class MemorialPageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MemorialPage.objects.filter(status='active')
    serializer_class = MemorialPageSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    def get_serializer_context(self):
        return {'request': self.request}
    @action(detail=False, methods=['get'])
    def listing(self, request):
        queryset = self.get_queryset()
        serializer = MemorialPageListSerializer(queryset, many=True)
        return Response(serializer.data)

class ManagedMemorialPageViewSet(viewsets.ModelViewSet):
    serializer_class = MemorialPageSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditMemorialPagePermission]
    lookup_field = 'slug'
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return MemorialPage.objects.all()
        
        # Neue konsistente FamilyLink-Integration
        linked_deceased_ids = FamilyLink.objects.filter(
            relative_user=user, 
            status=FamilyLink.Status.ACTIVE,
            permission_level__in=[
                FamilyLink.PermissionLevel.EDIT_MEMORIAL, 
                FamilyLink.PermissionLevel.MANAGE_ALL,
                FamilyLink.PermissionLevel.ADMIN_LEVEL
            ],
            deceased_user__role=User.Role.VERSTORBENER
        ).values_list('deceased_user_id', flat=True)
        
        return MemorialPage.objects.filter(
            Q(user=user) | Q(user_id__in=list(linked_deceased_ids))
        )

class CondolenceViewSet(viewsets.ModelViewSet):
    serializer_class = CondolenceSerializer
    permission_classes = [AllowGuestPostIsOwnerOrReadOnly]
    def get_queryset(self):
        if 'page_slug' in self.kwargs:
            return Condolence.objects.filter(page__slug=self.kwargs['page_slug'], is_approved=True)
        return Condolence.objects.all()
    def perform_create(self, serializer):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        author = self.request.user if self.request.user.is_authenticated else None
        is_approved_on_creation = (page.condolence_moderation == MemorialPage.ModerationStatus.NOT_MODERATED)
        serializer.save(page=page, author=author, is_approved=is_approved_on_creation)

class MemorialCandleViewSet(viewsets.ModelViewSet):
    serializer_class = MemorialCandleSerializer
    permission_classes = [AllowGuestPostIsOwnerOrReadOnly]
    def get_queryset(self):
        if 'page_slug' in self.kwargs:
            return MemorialCandle.objects.filter(page__slug=self.kwargs['page_slug'])
        return MemorialCandle.objects.all()
    def perform_create(self, serializer):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        author = self.request.user if self.request.user.is_authenticated else None
        serializer.save(page=page, author=author)

class TimelineEventViewSet(viewsets.ModelViewSet):
    serializer_class = TimelineEventSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditMemorialPagePermission]
    def get_queryset(self):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        self.check_object_permissions(self.request, page)
        return TimelineEvent.objects.filter(page=page)
    def perform_create(self, serializer):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        self.check_object_permissions(self.request, page)
        serializer.save(page=page)

class GalleryItemViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditMemorialPagePermission]
    def get_queryset(self):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        self.check_object_permissions(self.request, page)
        return GalleryItem.objects.filter(page=page)
    def perform_create(self, serializer):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        self.check_object_permissions(self.request, page)
        serializer.save(page=page)

class ReleaseRequestViewSet(viewsets.ModelViewSet):
    queryset = ReleaseRequest.objects.all()
    serializer_class = ReleaseRequestSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        password = make_password(serializer.validated_data['reporter_password'])
        serializer.save(reporter_password=password)

class SiteSettingsView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SiteSettingsSerializer

    def get_object(self):
        obj, created = SiteSettings.objects.get_or_create(pk=1)
        return obj

class MyContributionsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        condolences = Condolence.objects.filter(author=user)
        candles = MemorialCandle.objects.filter(author=user)
        
        condolence_serializer = CondolenceSerializer(condolences, many=True, context={'request': request})
        candle_serializer = MemorialCandleSerializer(candles, many=True, context={'request': request})

        return Response({
            'condolences': condolence_serializer.data,
            'candles': candle_serializer.data
        })

class MemorialEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MemorialEventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return MemorialEvent.objects.filter(page__slug=self.kwargs['page_slug'], is_public=True)

class EventAttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = EventAttendanceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return EventAttendance.objects.filter(event_id=self.kwargs['event_pk'])

    def perform_create(self, serializer):
        event = generics.get_object_or_404(MemorialEvent, pk=self.kwargs['event_pk'])
        author = self.request.user if self.request.user.is_authenticated else None
        serializer.save(event=event, user=author)

class MeinBereichDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        try:
            own_page = MemorialPage.objects.get(user=user)
        except MemorialPage.DoesNotExist:
            own_page = None
        
        try:
            # Neue konsistente FamilyLink-Integration
            managed_links = FamilyLink.objects.filter(
                relative_user=user, 
                status=FamilyLink.Status.ACTIVE,
                permission_level__in=[
                    FamilyLink.PermissionLevel.EDIT_MEMORIAL, 
                    FamilyLink.PermissionLevel.MANAGE_ALL,
                    FamilyLink.PermissionLevel.ADMIN_LEVEL
                ],
                is_validated_by_admin=True
            )
        except Exception as e:
            if "column api_familylink.id does not exist" in str(e):
                # Fallback: Verwende Raw SQL
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute(get_consistent_familylink_sql(
                        "WHERE fl.relative_user_id = %s AND COALESCE(fl.permission_level, 'view_only') IN ('edit_memorial', 'manage_all')"
                    ), [user.id])
                    
                    class MockFamilyLink:
                        def __init__(self, row):
                            self.id = row[0]
                            self.relationship = row[1] or ''
                            self.role = row[2] or 'family_member'
                            self.permission_level = row[3] or 'view_only'
                            self.is_active = row[4] if row[4] is not None else True
                            self.is_validated_by_admin = row[5] if row[5] is not None else False
                            self.validated_at = row[6]
                            self.created_at = row[7]
                            self.updated_at = row[8]
                            self.notes = row[9] or ''
                            
                            # Mock User-Objekte
                            self.deceased_user = type('User', (), {
                                'id': row[10],
                                'pk': row[10]
                            })()
                            
                            self.relative_user = user
                    
                    rows = cursor.fetchall()
                    managed_links = [MockFamilyLink(row) for row in rows]
            else:
                managed_links = []
        managed_pages = [link.deceased_user.memorial_page for link in managed_links if hasattr(link.deceased_user, 'memorial_page')]
        
        serializer = MeinBereichDataSerializer({
            'own_page': own_page,
            'managed_pages': managed_pages
        }, context={'request': request})
        
        return Response(serializer.data)

class CreateMemorialPageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if hasattr(user, 'memorial_page'):
            return Response({'error': 'Für diesen Benutzer existiert bereits eine Gedenkseite.'}, status=status.HTTP_400_BAD_REQUEST)

        # Erstellt eine minimale, inaktive Gedenkseite
        page = MemorialPage.objects.create(
            user=user,
            first_name=user.first_name,
            last_name=user.last_name,
            status=MemorialPage.Status.INACTIVE
        )
        serializer = MemorialPageSerializer(page, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FamilyLinkViewSet(viewsets.ModelViewSet):
    """ViewSet für FamilyLink-Verwaltung - Vollständig überarbeitet für Konsistenz"""
    queryset = FamilyLink.objects.all()
    serializer_class = FamilyLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'role', 'permission_level', 'is_validated_by_admin']
    search_fields = ['relationship', 'notes', 'deceased_user__first_name', 'deceased_user__last_name', 'relative_user__first_name', 'relative_user__last_name']
    ordering_fields = ['created_at', 'updated_at', 'last_accessed', 'access_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
            queryset = FamilyLink.objects.select_related(
                'deceased_user', 'relative_user', 'created_by', 'validated_by'
            )
            
            # Admins können alle FamilyLinks sehen
            if user.is_staff:
                return queryset
            
            # Normale Benutzer können nur ihre eigenen FamilyLinks sehen
            return queryset.filter(
                Q(relative_user=user) | Q(deceased_user=user)
            )
    
    def get_serializer_class(self):
        """Verwende verschiedene Serializer für verschiedene Aktionen"""
        if self.action == 'list':
            return FamilyLinkSerializer
        elif self.action == 'retrieve':
            return FamilyLinkSerializer
        else:
            return FamilyLinkSerializer
    
    def perform_create(self, serializer):
        """Beim Erstellen einer FamilyLink-Verknüpfung"""
        # Setze den Ersteller
        serializer.save(created_by=self.request.user)
        
        # Logging für Audit-Trail
        if hasattr(self.request, 'META'):
            ip_address = self.request.META.get('REMOTE_ADDR')
            # Hier könnte man ein Audit-Log erstellen
    
    def perform_update(self, serializer):
        """Beim Aktualisieren einer FamilyLink-Verknüpfung"""
        instance = serializer.save()
        
        # Wenn Status auf ACTIVE gesetzt wird, automatisch validieren
        if instance.status == FamilyLink.Status.ACTIVE and not instance.is_validated_by_admin:
            instance.is_validated_by_admin = True
            instance.validated_by = self.request.user
            instance.save()
    
    def perform_destroy(self, instance):
        """Beim Löschen einer FamilyLink-Verknüpfung"""
        # Soft delete: Setze Status auf REVOKED statt zu löschen
        instance.status = FamilyLink.Status.REVOKED
        instance.save()
    
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """Admin-Aktion: Validiere eine FamilyLink-Verknüpfung"""
        if not request.user.is_staff:
            return Response({'error': 'Nur Admins können validieren'}, status=status.HTTP_403_FORBIDDEN)
        
        family_link = self.get_object()
        family_link.is_validated_by_admin = True
        family_link.validated_by = request.user
        family_link.status = FamilyLink.Status.ACTIVE
        family_link.save()
        
        serializer = self.get_serializer(family_link)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Admin-Aktion: Sperre eine FamilyLink-Verknüpfung"""
        if not request.user.is_staff:
            return Response({'error': 'Nur Admins können sperren'}, status=status.HTTP_403_FORBIDDEN)
        
        family_link = self.get_object()
        family_link.status = FamilyLink.Status.SUSPENDED
        family_link.save()
        
        serializer = self.get_serializer(family_link)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def record_access(self, request, pk=None):
        """Zeichne einen Zugriff auf"""
        family_link = self.get_object()
        
        # Prüfe ob der Benutzer berechtigt ist
        if (family_link.relative_user != request.user and 
            family_link.deceased_user != request.user and 
            not request.user.is_staff):
            return Response({'error': 'Nicht berechtigt'}, status=status.HTTP_403_FORBIDDEN)
        
        ip_address = request.META.get('REMOTE_ADDR')
        family_link.record_access(ip_address)
        
        serializer = self.get_serializer(family_link)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiken für FamilyLinks"""
        if not request.user.is_staff:
            return Response({'error': 'Nur Admins können Statistiken abrufen'}, status=status.HTTP_403_FORBIDDEN)
        
        stats = {
            'total_links': FamilyLink.objects.count(),
            'active_links': FamilyLink.objects.filter(status=FamilyLink.Status.ACTIVE).count(),
            'pending_links': FamilyLink.objects.filter(status=FamilyLink.Status.PENDING).count(),
            'suspended_links': FamilyLink.objects.filter(status=FamilyLink.Status.SUSPENDED).count(),
            'revoked_links': FamilyLink.objects.filter(status=FamilyLink.Status.REVOKED).count(),
            'validated_links': FamilyLink.objects.filter(is_validated_by_admin=True).count(),
            'unvalidated_links': FamilyLink.objects.filter(is_validated_by_admin=False).count(),
            'total_accesses': FamilyLink.objects.aggregate(
                total=models.Sum('access_count')
            )['total'] or 0,
            'recent_accesses': FamilyLink.objects.filter(
                last_accessed__gte=timezone.now() - timezone.timedelta(days=7)
            ).count()
        }
        
        return Response(stats)


# ===== TRAUERDRUCK VIEWS =====

class TrauerdruckTypeViewSet(viewsets.ModelViewSet):
    """ViewSet für Trauerdruck-Typen"""
    queryset = TrauerdruckType.objects.filter(is_active=True)
    serializer_class = TrauerdruckTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TrauerdruckType.objects.filter(is_active=True).order_by('name')


class TrauerdruckEntwurfViewSet(viewsets.ModelViewSet):
    """ViewSet für Trauerdruck-Entwürfe"""
    queryset = TrauerdruckEntwurf.objects.all()
    serializer_class = TrauerdruckEntwurfSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        queryset = TrauerdruckEntwurf.objects.select_related(
            'memorial_page', 'trauerdruck_type', 'created_by', 'design_file', 'preview_file'
        ).prefetch_related('assigned_to', 'kommentare', 'freigaben')
        
        # Filter by user role and permissions
        user = self.request.user
        if user.role == 'bestatter':
            # Bestatter können alle Entwürfe sehen
            pass
        else:
            # Angehörige können nur Entwürfe ihrer Gedenkseiten sehen
            queryset = queryset.filter(
                memorial_page__family_members__user=user
            )
        
        # Additional filters
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
            
        memorial_page = self.request.query_params.get('memorial_page')
        if memorial_page:
            queryset = queryset.filter(memorial_page=memorial_page)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        entwurf = serializer.save(created_by=self.request.user)
        # Benachrichtigungen senden
        try:
            TrauerdruckNotificationService.notify_new_draft(entwurf)
        except Exception as e:
            print(f"Fehler beim Senden der Benachrichtigungen: {e}")
            # Benachrichtigungsfehler sollen den Entwurf nicht stoppen
    
    @action(detail=True, methods=['get'])
    def kommentare(self, request, pk=None):
        """Alle Kommentare für einen Entwurf abrufen"""
        entwurf = self.get_object()
        kommentare = entwurf.kommentare.all().order_by('created_at')
        serializer = TrauerdruckKommentarSerializer(kommentare, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def freigaben(self, request, pk=None):
        """Alle Freigaben für einen Entwurf abrufen"""
        entwurf = self.get_object()
        freigaben = entwurf.freigaben.all().order_by('-created_at')
        serializer = TrauerdruckFreigabeSerializer(freigaben, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiken für das Dashboard abrufen"""
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'pending': queryset.filter(status='pending_approval').count(),
            'approved': queryset.filter(status='approved').count(),
            'revision_requested': queryset.filter(status='revision_requested').count(),
            'rejected': queryset.filter(status='rejected').count(),
            'completed': queryset.filter(status='completed').count(),
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def send_to_family(self, request, pk=None):
        """Entwurf an Familie senden"""
        entwurf = self.get_object()
        entwurf.status = 'pending_approval'
        entwurf.save()
        
        # Benachrichtigungen senden
        try:
            TrauerdruckNotificationService.notify_approval_requested(entwurf)
        except Exception as e:
            print(f"Fehler beim Senden der Benachrichtigungen: {e}")
        
        return Response({'status': 'sent_to_family'})
    
    @action(detail=True, methods=['post'])
    def request_revision(self, request, pk=None):
        """Revision anfordern"""
        entwurf = self.get_object()
        reason = request.data.get('reason', '')
        
        entwurf.status = 'revision_requested'
        entwurf.save()
        
        # Kommentar hinzufügen
        if reason:
            TrauerdruckKommentar.objects.create(
                entwurf=entwurf,
                author=request.user,
                content=f"Revision angefordert: {reason}",
                is_internal=True
            )
        
        # Benachrichtigungen senden
        try:
            TrauerdruckNotificationService.notify_revision_requested(entwurf, request.user)
        except Exception as e:
            print(f"Fehler beim Senden der Benachrichtigungen: {e}")
        
        return Response({'status': 'revision_requested'})
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Entwurf als abgeschlossen markieren"""
        entwurf = self.get_object()
        entwurf.status = 'completed'
        entwurf.save()
        
        # Benachrichtigungen senden
        try:
            TrauerdruckNotificationService.notify_completed(entwurf)
        except Exception as e:
            print(f"Fehler beim Senden der Benachrichtigungen: {e}")
        
        return Response({'status': 'completed'})


class TrauerdruckKommentarViewSet(viewsets.ModelViewSet):
    """ViewSet für Trauerdruck-Kommentare"""
    queryset = TrauerdruckKommentar.objects.all()
    serializer_class = TrauerdruckKommentarSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TrauerdruckKommentar.objects.select_related('entwurf', 'author')
        
        # Filter by entwurf if provided
        entwurf_id = self.request.query_params.get('entwurf')
        if entwurf_id:
            queryset = queryset.filter(entwurf=entwurf_id)
        
        return queryset.order_by('created_at')
    
    def perform_create(self, serializer):
        kommentar = serializer.save(author=self.request.user)
        # Benachrichtigungen senden
        try:
            TrauerdruckNotificationService.notify_comment_added(kommentar.entwurf, self.request.user)
        except Exception as e:
            print(f"Fehler beim Senden der Kommentar-Benachrichtigungen: {e}")
            # Benachrichtigungsfehler sollen den Kommentar nicht stoppen


class TrauerdruckFreigabeViewSet(viewsets.ModelViewSet):
    """ViewSet für Trauerdruck-Freigaben"""
    queryset = TrauerdruckFreigabe.objects.all()
    serializer_class = TrauerdruckFreigabeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TrauerdruckFreigabe.objects.select_related('entwurf', 'reviewer')
        
        # Filter by entwurf if provided
        entwurf_id = self.request.query_params.get('entwurf')
        if entwurf_id:
            queryset = queryset.filter(entwurf=entwurf_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        try:
            freigabe = serializer.save(reviewer=self.request.user)
            # Workflow verarbeiten
            try:
                TrauerdruckWorkflowService.process_approval(
                    entwurf=freigabe.entwurf,
                    decision=freigabe.decision,
                    reviewer=self.request.user,
                    comment=freigabe.comment,
                    revision_notes=freigabe.revision_notes
                )
            except Exception as workflow_error:
                # Log den Workflow-Fehler, aber lasse die Freigabe trotzdem speichern
                print(f"Fehler im Workflow-Service: {workflow_error}")
                import traceback
                traceback.print_exc()
        except Exception as e:
            # Log den Serializer-Fehler
            print(f"Fehler beim Speichern der Freigabe: {e}")
            import traceback
            traceback.print_exc()
            raise  # Re-raise den Fehler, damit der Client ihn sieht


class TrauerdruckBenachrichtigungViewSet(viewsets.ModelViewSet):
    """ViewSet für Trauerdruck-Benachrichtigungen"""
    queryset = TrauerdruckBenachrichtigung.objects.all()
    serializer_class = TrauerdruckBenachrichtigungSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TrauerdruckBenachrichtigung.objects.filter(
            user=self.request.user
        ).select_related('entwurf').order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Ungelesene Benachrichtigungen abrufen"""
        unread_notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(unread_notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Benachrichtigung als gelesen markieren"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Alle Benachrichtigungen als gelesen markieren"""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})


class TrauerdruckTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet für Trauerdruck-Templates"""
    queryset = TrauerdruckTemplate.objects.filter(is_active=True)
    serializer_class = TrauerdruckTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TrauerdruckTemplate.objects.filter(is_active=True).select_related(
            'trauerdruck_type', 'created_by', 'template_file'
        )
        
        # Filter by type if provided
        trauerdruck_type = self.request.query_params.get('trauerdruck_type')
        if trauerdruck_type:
            queryset = queryset.filter(trauerdruck_type=trauerdruck_type)
        
        return queryset.order_by('name')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TrauerdruckDesignViewSet(viewsets.ModelViewSet):
    """ViewSet für Trauerdruck-Designs"""
    queryset = TrauerdruckDesign.objects.all()
    serializer_class = TrauerdruckDesignSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TrauerdruckDesign.objects.select_related(
            'entwurf', 'design_file', 'preview_file'
        ).prefetch_related('freigaben')
        
        # Filter by entwurf if provided
        entwurf_id = self.request.query_params.get('entwurf')
        if entwurf_id:
            queryset = queryset.filter(entwurf=entwurf_id)
        
        return queryset.order_by('entwurf', 'order', 'created_at')
    
    @action(detail=True, methods=['get'])
    def freigaben(self, request, pk=None):
        """Alle Freigaben für ein Design abrufen"""
        design = self.get_object()
        freigaben = design.freigaben.all().order_by('-created_at')
        serializer = TrauerdruckDesignFreigabeSerializer(freigaben, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Design freigeben"""
        design = self.get_object()
        design.is_approved = True
        design.save()
        
        # Benachrichtigungen senden
        try:
            TrauerdruckNotificationService.notify_decision(design.entwurf, 'approved', request.user)
        except Exception as e:
            print(f"Fehler beim Senden der Benachrichtigungen: {e}")
        
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Design ablehnen"""
        design = self.get_object()
        design.is_approved = False
        design.save()
        
        # Benachrichtigungen senden
        try:
            TrauerdruckNotificationService.notify_decision(design.entwurf, 'rejected', request.user)
        except Exception as e:
            print(f"Fehler beim Senden der Benachrichtigungen: {e}")
        
        return Response({'status': 'rejected'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Design aktivieren"""
        design = self.get_object()
        design.is_active = True
        design.save()
        return Response({'status': 'activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Design deaktivieren"""
        design = self.get_object()
        design.is_active = False
        design.save()
        return Response({'status': 'deactivated'})


class TrauerdruckDesignFreigabeViewSet(viewsets.ModelViewSet):
    """ViewSet für Trauerdruck-Design-Freigaben"""
    queryset = TrauerdruckDesignFreigabe.objects.all()
    serializer_class = TrauerdruckDesignFreigabeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TrauerdruckDesignFreigabe.objects.select_related('design', 'reviewer')
        
        # Filter by design if provided
        design_id = self.request.query_params.get('design')
        if design_id:
            queryset = queryset.filter(design=design_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        freigabe = serializer.save(reviewer=self.request.user)
        
        # Design-Status aktualisieren basierend auf der Entscheidung
        design = freigabe.design
        if freigabe.decision == 'approved':
            design.is_approved = True
        elif freigabe.decision == 'rejected':
            design.is_approved = False
        design.save()
        
        # Benachrichtigungen senden
        try:
            TrauerdruckNotificationService.notify_decision(design.entwurf, freigabe.decision, self.request.user)
        except Exception as e:
            print(f"Fehler beim Senden der Benachrichtigungen: {e}")


# ============================================================================
# BESTATTUNGSVORSORGE VIEWSETS
# ============================================================================

class BestattungsartViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet für Bestattungsarten"""
    queryset = Bestattungsart.objects.filter(is_active=True)
    serializer_class = BestattungsartSerializer
    permission_classes = [permissions.IsAuthenticated]

class VerabschiedungsartViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet für Verabschiedungsarten"""
    queryset = Verabschiedungsart.objects.filter(is_active=True)
    serializer_class = VerabschiedungsartSerializer
    permission_classes = [permissions.IsAuthenticated]

class MusikKategorieViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet für Musik-Kategorien"""
    queryset = MusikKategorie.objects.filter(is_active=True)
    serializer_class = MusikKategorieSerializer
    permission_classes = [permissions.IsAuthenticated]

class VereinsKategorieViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet für Vereinskategorien"""
    queryset = VereinsKategorie.objects.filter(is_active=True)
    serializer_class = VereinsKategorieSerializer
    permission_classes = [permissions.IsAuthenticated]

class GrabartViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet für Grabarten"""
    queryset = Grabart.objects.filter(is_active=True)
    serializer_class = GrabartSerializer
    permission_classes = [permissions.IsAuthenticated]

class DokumentKategorieViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet für Dokumentkategorien"""
    queryset = DokumentKategorie.objects.filter(is_active=True)
    serializer_class = DokumentKategorieSerializer
    permission_classes = [permissions.IsAuthenticated]

class DigitalerNachlassKategorieViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet für Digitaler Nachlass Kategorien"""
    queryset = DigitalerNachlassKategorie.objects.filter(is_active=True)
    serializer_class = DigitalerNachlassKategorieSerializer
    permission_classes = [permissions.IsAuthenticated]

class BestattungsvorsorgeViewSet(viewsets.ModelViewSet):
    """ViewSet für Bestattungsvorsorge"""
    serializer_class = BestattungsvorsorgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Bestattungsvorsorge.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        # Berechne Fortschritt neu
        instance = serializer.save()
        instance.completion_percentage = instance.calculate_completion_percentage()
        instance.save()
    
    @action(detail=True, methods=['post'])
    def add_dokument(self, request, pk=None):
        """Dokument zur Vorsorge hinzufügen"""
        vorsorge = self.get_object()
        kategorie_id = request.data.get('kategorie')
        titel = request.data.get('titel')
        datei = request.data.get('datei')
        
        if not all([kategorie_id, titel, datei]):
            return Response({'error': 'Kategorie, Titel und Datei sind erforderlich'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            dokument = BestattungsvorsorgeDokument.objects.create(
                vorsorge=vorsorge,
                kategorie_id=kategorie_id,
                titel=titel,
                datei=datei,
                is_uploaded=True
            )
            serializer = BestattungsvorsorgeDokumentSerializer(dokument)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_digitaler_nachlass(self, request, pk=None):
        """Digitalen Nachlass zur Vorsorge hinzufügen"""
        vorsorge = self.get_object()
        kategorie_id = request.data.get('kategorie')
        plattform = request.data.get('plattform')
        
        if not all([kategorie_id, plattform]):
            return Response({'error': 'Kategorie und Plattform sind erforderlich'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            nachlass = DigitalerNachlass.objects.create(
                vorsorge=vorsorge,
                kategorie_id=kategorie_id,
                plattform=plattform,
                benutzername=request.data.get('benutzername', ''),
                email=request.data.get('email', ''),
                notizen=request.data.get('notizen', ''),
                is_important=request.data.get('is_important', False)
            )
            serializer = DigitalerNachlassSerializer(nachlass)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_vorsorge(self, request):
        """Aktuelle Vorsorge des Benutzers abrufen"""
        try:
            vorsorge = Bestattungsvorsorge.objects.get(user=request.user)
            serializer = self.get_serializer(vorsorge)
            return Response(serializer.data)
        except Bestattungsvorsorge.DoesNotExist:
            return Response({'message': 'Keine Vorsorge vorhanden'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def create_vorsorge(self, request):
        """Neue Vorsorge erstellen"""
        try:
            # Prüfe ob bereits eine Vorsorge existiert
            existing = Bestattungsvorsorge.objects.filter(user=request.user).first()
            if existing:
                return Response({'error': 'Vorsorge bereits vorhanden'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                vorsorge = serializer.save(user=request.user)
                return Response(self.get_serializer(vorsorge).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ============================================================================
# INITIALISIERUNGS-ENDPOINT FÜR BESTATTUNGSVORSORGE
# ============================================================================

class InitializeBestattungsvorsorgeView(APIView):
    """
    Endpoint zum Initialisieren aller Bestattungsvorsorge-Kategorien
    """
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        try:
            # Bestattungsarten
            bestattungsarten = [
                ('Erdbestattung', 'Traditionelle Bestattung im Sarg unter der Erde', 'fas fa-cross'),
                ('Feuerbestattung', 'Einäscherung und Beisetzung der Urne', 'fas fa-fire'),
                ('Seebestattung', 'Beisetzung der Urne im Meer', 'fas fa-water'),
                ('Baumbestattung', 'Beisetzung der Urne an einem Baum', 'fas fa-tree'),
                ('Anonyme Bestattung', 'Bestattung ohne Grabstein oder Kennzeichnung', 'fas fa-user-secret'),
                ('Diamantbestattung', 'Asche wird zu einem Diamanten verarbeitet', 'fas fa-gem')
            ]
            
            for i, (name, desc, icon) in enumerate(bestattungsarten, 1):
                Bestattungsart.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': desc,
                        'icon': icon,
                        'order': i,
                        'is_active': True
                    }
                )
            
            # Verabschiedungsarten
            verabschiedungsarten = [
                ('Weltliche Trauerfeier', 'Nicht-religiöse Verabschiedung', False, '', 'fas fa-handshake'),
                ('Katholische Trauerfeier', 'Katholische Messe und Segnung', True, 'Katholisch', 'fas fa-cross'),
                ('Evangelische Trauerfeier', 'Evangelischer Gottesdienst', True, 'Evangelisch', 'fas fa-church'),
                ('Jüdische Trauerfeier', 'Jüdische Bestattungsriten', True, 'Jüdisch', 'fas fa-star-of-david'),
                ('Islamische Trauerfeier', 'Islamische Bestattungsriten', True, 'Islamisch', 'fas fa-mosque'),
                ('Buddhistische Trauerfeier', 'Buddhistische Bestattungsriten', True, 'Buddhistisch', 'fas fa-om')
            ]
            
            for i, (name, desc, is_rel, religion, icon) in enumerate(verabschiedungsarten, 1):
                Verabschiedungsart.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': desc,
                        'is_religious': is_rel,
                        'religion': religion,
                        'icon': icon,
                        'order': i,
                        'is_active': True
                    }
                )
            
            # Musik-Kategorien
            musik_kategorien = [
                ('Klassische Musik', 'Klassische Trauermusik und Orgelmusik', 'fas fa-music'),
                ('Moderne Musik', 'Zeitgenössische Lieder und Popmusik', 'fas fa-headphones'),
                ('Religiöse Musik', 'Kirchenmusik und geistliche Lieder', 'fas fa-church'),
                ('Instrumentalmusik', 'Instrumentale Stücke ohne Gesang', 'fas fa-guitar'),
                ('Chormusik', 'Gesang und Chormusik', 'fas fa-users'),
                ('Volksmusik', 'Traditionelle und volkstümliche Musik', 'fas fa-accordion')
            ]
            
            for i, (name, desc, icon) in enumerate(musik_kategorien, 1):
                MusikKategorie.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': desc,
                        'icon': icon,
                        'order': i,
                        'is_active': True
                    }
                )
            
            # Vereins-Kategorien
            vereins_kategorien = [
                ('Feuerwehr', 'Freiwillige Feuerwehr und Berufsfeuerwehr', 'fas fa-fire-extinguisher'),
                ('Musikverein', 'Musikvereine und Blaskapellen', 'fas fa-music'),
                ('Sportverein', 'Sportvereine und Sportclubs', 'fas fa-futbol'),
                ('Kirchenchor', 'Kirchenchöre und Gesangsvereine', 'fas fa-users'),
                ('Veteranenverein', 'Veteranen- und Soldatenvereine', 'fas fa-medal'),
                ('Gesangsverein', 'Gesangsvereine und Chöre', 'fas fa-microphone'),
                ('Schützenverein', 'Schützenvereine und Schützenbruderschaften', 'fas fa-bullseye'),
                ('Karnevalsverein', 'Karnevals- und Fastnachtsvereine', 'fas fa-mask')
            ]
            
            for i, (name, desc, icon) in enumerate(vereins_kategorien, 1):
                VereinsKategorie.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': desc,
                        'icon': icon,
                        'order': i,
                        'is_active': True
                    }
                )
            
            # Grabarten
            grabarten = [
                ('Einzelgrab', 'Grab für eine Person, meist 20-25 Jahre Nutzungsrecht', 'fas fa-tombstone'),
                ('Doppelgrab', 'Grab für zwei Personen (Ehepartner), längere Nutzungszeit', 'fas fa-heart'),
                ('Familiengrab', 'Grab für mehrere Familienmitglieder, oft über Generationen', 'fas fa-users'),
                ('Urnengrab', 'Kleineres Grab für Urnenbestattung', 'fas fa-urn'),
                ('Anonymes Grab', 'Grab ohne Grabstein oder Kennzeichnung', 'fas fa-user-secret'),
                ('Wahlgrab', 'Grab mit freier Wahl der Grabgestaltung', 'fas fa-star'),
                ('Reihengrab', 'Grab in einer Reihe, einfache Gestaltung', 'fas fa-list'),
                ('Rasengrab', 'Grab mit Rasenfläche, einfache Pflege', 'fas fa-seedling')
            ]
            
            for i, (name, desc, icon) in enumerate(grabarten, 1):
                Grabart.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': desc,
                        'icon': icon,
                        'order': i,
                        'is_active': True
                    }
                )
            
            # Dokument-Kategorien
            dokument_kategorien = [
                ('Personalausweis', 'Gültiger Personalausweis oder Reisepass', True, 'fas fa-id-card'),
                ('Geburtsurkunde', 'Geburtsurkunde oder beglaubigte Kopie', True, 'fas fa-baby'),
                ('Heiratsurkunde', 'Heiratsurkunde oder beglaubigte Kopie', False, 'fas fa-ring'),
                ('Bestattungsvertrag', 'Vertrag mit Bestattungsunternehmen', True, 'fas fa-file-contract'),
                ('Grabvertrag', 'Vertrag für Grabnutzung', False, 'fas fa-tombstone'),
                ('Sterbegeldversicherung', 'Versicherungsunterlagen für Sterbegeld', False, 'fas fa-shield-alt'),
                ('Lebensversicherung', 'Lebensversicherungsunterlagen', False, 'fas fa-heart'),
                ('Testament', 'Testament oder letzter Wille', False, 'fas fa-scroll'),
                ('Vollmacht', 'Vollmacht für Bestattungsangelegenheiten', False, 'fas fa-signature'),
                ('Arztberichte', 'Wichtige medizinische Unterlagen', False, 'fas fa-stethoscope')
            ]
            
            for i, (name, desc, required, icon) in enumerate(dokument_kategorien, 1):
                DokumentKategorie.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': desc,
                        'is_required': required,
                        'icon': icon,
                        'order': i,
                        'is_active': True
                    }
                )
            
            # Digitaler Nachlass-Kategorien
            digitaler_nachlass_kategorien = [
                ('Soziale Medien', 'Facebook, Instagram, Twitter, LinkedIn, etc.', 'fas fa-share-alt'),
                ('E-Mail & Cloud', 'E-Mail-Accounts und Cloud-Speicher', 'fas fa-envelope'),
                ('Banking & Finanzen', 'Online-Banking, PayPal, Kryptowährungen', 'fas fa-credit-card'),
                ('E-Commerce', 'Amazon, eBay, Online-Shops, Abonnements', 'fas fa-shopping-cart'),
                ('Entertainment', 'Netflix, Spotify, Gaming-Accounts', 'fas fa-gamepad'),
                ('Berufliche Accounts', 'LinkedIn, XING, berufliche E-Mails', 'fas fa-briefcase'),
                ('Fotografie & Videos', 'Flickr, YouTube, Vimeo, Foto-Clouds', 'fas fa-camera'),
                ('Blogs & Websites', 'Eigene Websites, Blogs, Domains', 'fas fa-globe'),
                ('Dating & Partnersuche', 'Tinder, Parship, eHarmony, etc.', 'fas fa-heart'),
                ('Sonstige Accounts', 'Andere Online-Accounts und Services', 'fas fa-ellipsis-h')
            ]
            
            for i, (name, desc, icon) in enumerate(digitaler_nachlass_kategorien, 1):
                DigitalerNachlassKategorie.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': desc,
                        'icon': icon,
                        'order': i,
                        'is_active': True
                    }
                )
            
            return Response({
                'message': 'Alle Bestattungsvorsorge-Kategorien wurden erfolgreich initialisiert!',
                'bestattungsarten': Bestattungsart.objects.count(),
                'verabschiedungsarten': Verabschiedungsart.objects.count(),
                'musik_kategorien': MusikKategorie.objects.count(),
                'vereins_kategorien': VereinsKategorie.objects.count(),
                'grabarten': Grabart.objects.count(),
                'dokument_kategorien': DokumentKategorie.objects.count(),
                'digitaler_nachlass_kategorien': DigitalerNachlassKategorie.objects.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Fehler bei der Initialisierung: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
