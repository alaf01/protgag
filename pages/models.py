from django.db import models


class Article(models.Model):
    title = models.CharField(max_length=400)
    authors = models.CharField(max_length=500)
    year = models.PositiveIntegerField()
    journal = models.CharField(max_length=400)
    rest = models.CharField(max_length=400, blank=True)
    doi = models.URLField(blank=True)


class News(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()