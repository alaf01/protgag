from django.conf.urls.static import static
from django.urls import path

from protgag import settings
from . import views

urlpatterns = [
    path('', views.home, name="home"),
    path('news/', views.news, name="news"),
    path('research/', views.research, name="research"),
    path('projects/', views.projects, name="projects"),
    path('projects/sonta_bis', views.sonata_bis, name="sonata_bis"),
    path('projects/beethoven', views.beethoven, name="beethoven"),
    path('projects/preludium', views.preludium, name="preludium"),
    path('projects/polonez', views.polonez, name="polonez"),
    path('projects/opus', views.opus, name="opus"),
    path('publications/', views.publications, name="publications"),
    path('members/', views.members, name="members"),
    path('collaborations/', views.collaborations, name="collaborations"),
    path('downloads/', views.downloads, name="downloads"),
    path('positions/', views.positions, name="positions"),
    path('contact/', views.contact, name="contact"),
    ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
