from django.contrib import admin
from .models import Article, News, Member


@admin.register(Article)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('title', 'authors', 'year', 'journal', 'doi')
    search_fields = ('year', 'journal')


admin.site.register(News)
admin.site.register(Member)
