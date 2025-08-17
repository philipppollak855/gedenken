# backend/api/urls.py
# ERWEITERT: Neue Route für EventAttendance hinzugefügt.

from django.urls import path, include
from rest_framework_nested import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserViewSet, DigitalLegacyItemViewSet,
    FinancialItemViewSet, InsuranceItemViewSet, ContractItemViewSet,
    DocumentViewSet, LastWishesView, MemorialPageViewSet, CondolenceViewSet,
    MemorialCandleViewSet, ManagedMemorialPageViewSet, TimelineEventViewSet, 
    GalleryItemViewSet, ReleaseRequestViewSet, SiteSettingsView, MyContributionsView,
    CondolenceTemplateViewSet, CandleImageViewSet, CandleMessageTemplateViewSet,
    SeedDatabaseView, EventAttendanceViewSet, MemorialEventViewSet
)

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'digital-legacy', DigitalLegacyItemViewSet, basename='digitallegacyitem')
router.register(r'financials', FinancialItemViewSet, basename='financialitem')
router.register(r'insurances', InsuranceItemViewSet, basename='insuranceitem')
router.register(r'contracts', ContractItemViewSet, basename='contractitem')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'memorial-pages', MemorialPageViewSet, basename='memorialpage')
router.register(r'manage/memorial-pages', ManagedMemorialPageViewSet, basename='managed-memorialpage')
router.register(r'release-requests', ReleaseRequestViewSet, basename='releaserequest')
router.register(r'condolences', CondolenceViewSet, basename='condolence')
router.register(r'candles', MemorialCandleViewSet, basename='candle')
router.register(r'condolence-templates', CondolenceTemplateViewSet, basename='condolencetemplate')
router.register(r'candle-images', CandleImageViewSet, basename='candleimage')
router.register(r'candle-message-templates', CandleMessageTemplateViewSet, basename='candle-message-template')

pages_router = routers.NestedSimpleRouter(router, r'memorial-pages', lookup='page')
pages_router.register(r'condolences', CondolenceViewSet, basename='page-condolences')
pages_router.register(r'candles', MemorialCandleViewSet, basename='page-candles')
pages_router.register(r'events', MemorialEventViewSet, basename='page-events')

managed_pages_router = routers.NestedSimpleRouter(router, r'manage/memorial-pages', lookup='page')
managed_pages_router.register(r'timeline-events', TimelineEventViewSet, basename='page-timeline-events')
managed_pages_router.register(r'gallery-items', GalleryItemViewSet, basename='page-gallery-items')

# NEU: Router für die Teilnahme an Events
events_router = routers.NestedSimpleRouter(pages_router, r'events', lookup='event')
events_router.register(r'attendees', EventAttendanceViewSet, basename='event-attendees')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(pages_router.urls)),
    path('', include(managed_pages_router.urls)),
    path('', include(events_router.urls)),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('last-wishes/', LastWishesView.as_view(), name='last-wishes'),
    path('settings/', SiteSettingsView.as_view(), name='site-settings'),
    path('my-contributions/', MyContributionsView.as_view(), name='my-contributions'),
    path('seed-database/<str:key>/', SeedDatabaseView.as_view(), name='seed-database'),
]
