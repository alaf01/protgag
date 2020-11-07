from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name="home"),
    path('news/', views.news, name="news"),
    path('research/', views.research, name="research"),
    path('projects/', views.projects, name="projects"),
    path('projects/preludium', views.preludium, name="preludium"),
    path('projects/polonez', views.polonez, name="polonez"),
    path('publications/', views.publications, name="publications"),
    path('members/', views.members, name="members"),
    path('collaborations/', views.collaborations, name="collaborations"),
    path('downloads/', views.downloads, name="downloads"),
    path('contact/', views.contact, name="contact"),
    ]
