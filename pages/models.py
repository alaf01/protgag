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
    added = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name_plural = 'news'


class Research(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='staticfiles')
    order = models.PositiveIntegerField(unique=True)

    class Meta:
        verbose_name_plural = 'researches'