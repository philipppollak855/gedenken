# backend/api/views.py
# ERWEITERT: Neue, granulare Berechtigungs-Klassen wurden hinzugefügt, um die Zugriffsrechte von Angehörigen zu steuern.

import os
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

from .serializers import (
    RegisterSerializer, UserSerializer, DigitalLegacyItemSerializer,
    FinancialItemSerializer, InsuranceItemSerializer, ContractItemSerializer,
    DocumentSerializer, LastWishesSerializer, MemorialPageSerializer, 
    CondolenceSerializer, MemorialCandleSerializer, TimelineEventSerializer, 
    GalleryItemSerializer, ReleaseRequestSerializer,
    MemorialPageListSerializer, SiteSettingsSerializer, CondolenceTemplateSerializer,
    CandleImageSerializer, CandleMessageTemplateSerializer, EventAttendanceSerializer,
    MemorialEventSerializer
)
from .models import (
    User, DigitalLegacyItem, FinancialItem, InsuranceItem, ContractItem, 
    Document, LastWishes, MemorialPage, Condolence, MemorialCandle,
    TimelineEvent, GalleryItem, ReleaseRequest, SiteSettings, CondolenceTemplate,
    CandleImage, CandleMessageTemplate, EventLocation, MemorialEvent, EventAttendance,
    FamilyLink
)

class GlobalSearchView(APIView):
    """
    Stellt eine globale Suche über verschiedene Modelle im Admin-Backend bereit.
    """
    authentication_classes = [SessionAuthentication] # KORREKTUR: Erlaubt Authentifizierung aus dem Admin-Panel.
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', None)
        results = []

        if query and len(query) > 2:
            # Benutzer durchsuchen
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

            # Gedenkseiten durchsuchen
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

            # Kondolenzen durchsuchen
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


            # Gedenkkerzen durchsuchen
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
            return Response(
                {"error": "Secret key for seeding is not configured on the server."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        if key != SECRET_KEY:
            return Response(
                {"error": "Invalid secret key."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            print('Starting database seeding via API...')
            call_command('seed_data')
            print('Database seeding finished.')
            return Response({"message": "Database seeding initiated successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"An error occurred during seeding: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

# --- NEUE BERECHTIGUNGS-KLASSEN ---

class CanViewVorsorgeDataPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Jeder authentifizierte Benutzer darf die Liste seiner zugänglichen Daten abfragen.
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated: return False
        if user.is_staff or obj.user == user: return True
        return FamilyLink.objects.filter(
            deceased_user=obj.user, relative_user=user,
            can_view_precaution_data=True, is_validated_by_admin=True
        ).exists()

class CanEditVorsorgeDataPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated: return False
        if user.is_staff or obj.user == user: return True
        return FamilyLink.objects.filter(
            deceased_user=obj.user, relative_user=user,
            can_edit_precaution_data=True, is_validated_by_admin=True
        ).exists()

class CanEditMemorialPagePermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated: return False
        if user.is_staff or obj.user == user: return True
        return FamilyLink.objects.filter(
            deceased_user=obj.user, relative_user=user,
            can_edit_memorial_page=True
        ).exists()

# --- ViewSets mit neuen Berechtigungen ---

class DigitalLegacyItemViewSet(viewsets.ModelViewSet):
    serializer_class = DigitalLegacyItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        linked_deceased_ids = FamilyLink.objects.filter(relative_user=user, can_view_precaution_data=True, is_validated_by_admin=True).values_list('deceased_user_id', flat=True)
        return DigitalLegacyItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class FinancialItemViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        linked_deceased_ids = FamilyLink.objects.filter(relative_user=user, can_view_precaution_data=True, is_validated_by_admin=True).values_list('deceased_user_id', flat=True)
        return FinancialItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class InsuranceItemViewSet(viewsets.ModelViewSet):
    serializer_class = InsuranceItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        linked_deceased_ids = FamilyLink.objects.filter(relative_user=user, can_view_precaution_data=True, is_validated_by_admin=True).values_list('deceased_user_id', flat=True)
        return InsuranceItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class ContractItemViewSet(viewsets.ModelViewSet):
    serializer_class = ContractItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        linked_deceased_ids = FamilyLink.objects.filter(relative_user=user, can_view_precaution_data=True, is_validated_by_admin=True).values_list('deceased_user_id', flat=True)
        return ContractItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    parser_classes = [MultiPartParser, FormParser]
    def get_queryset(self):
        user = self.request.user
        linked_deceased_ids = FamilyLink.objects.filter(relative_user=user, can_view_precaution_data=True, is_validated_by_admin=True).values_list('deceased_user_id', flat=True)
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
        linked_deceased_ids = FamilyLink.objects.filter(
            relative_user=user, 
            can_edit_memorial_page=True,
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
    permission_classes = [permissions.IsAuthenticated, CanEditMemorialPagePermission] # Angepasst
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
    permission_classes = [permissions.IsAuthenticated, CanEditMemorialPagePermission] # Angepasst
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

