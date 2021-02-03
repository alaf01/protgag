from django.shortcuts import render
from .models import Article, News, Member


def home(request):
    return render(request, "home.html", {'home': True})


def news(request):
    news = News.objects.all().order_by('-added')
    return render(request, "news.html", {'news': True, 'queryset': news})


def research(request):
    return render(request, "research.html", {'research': True})


def projects(request):
    return render(request, "projects.html", {'projects': True})


def polonez(request):
    return render(request, "polonez.html", {'polonez': True})


def beethoven(request):
    return render(request, "beethoven.html", {'beethoven': True})


def sonata_bis(request):
    return render(request, "sonata_bis.html", {'sonata_bis': True})


def preludium(request):
    return render(request, "preludium.html", {'preludium': True})


def publications(request):
    publications = Article.objects.all().order_by('-timestamp')
    return render(request, "publications.html", {'publications': True, 'articles': publications})


def members(request):
    team = Member.objects.all().order_by('queue')
    return render(request, "members.html", {'members': True, 'team': team})


def collaborations(request):
    return render(request, "collaborations.html", {'collaborations': True})


def downloads(request):
    return render(request, "downloads.html", {'downloads': True})


def contact(request):
    return render(request, "contact.html", {'contact': True})


def positions(request):
    return render(request, "positions.html", {'positions': True})

