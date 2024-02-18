from django.db import models


class Article(models.Model):
    title = models.TextField()
    authors = models.TextField()
    year = models.PositiveIntegerField()
    journal = models.CharField(max_length=400)
    rest = models.TextField()
    doi = models.URLField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    position = models.PositiveIntegerField(default=0)

    def __str__(self):
        return '{}-{}-{}'.format(self.__class__.__name__, self.journal, self.year)


class News(models.Model):
    date = models.CharField(max_length=40, default='')
    title = models.CharField(max_length=200)
    description = models.TextField()
    link = models.URLField(blank=True, null=True)
    added = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name_plural = 'news'

    def __str__(self):
        return '{}-{}'.format(self.__class__.__name__, self.title)


class Member(models.Model):
    name = models.CharField(max_length=40)
    position = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='members')
    queue = models.PositiveIntegerField(default=0)
    cv = models.FileField(upload_to='members', blank=True)

    def __str__(self):
        return '{}-{}'.format(self.__class__.__name__, self.name)
