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


class Member(models.Model):
    name = models.CharField(max_length=40)
    surname = models.CharField(max_length=40)
    position = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='members')
    queue = models.PositiveIntegerField(default=0)



