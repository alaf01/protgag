from django.contrib import admin
from .models import Article, News, Research


@admin.register(Article)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('title', 'authors', 'year', 'journal', 'rest')
    search_fields = ('year', 'journal')


@admin.register(News)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('title', 'description')


@admin.register(Research)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'image')