from django.urls import path

from . import views

app_name = 'haneum'
urlpatterns = [
    path('', views.index, name='index'),
    path('search', views.search, name='search'),
    path('upload', views.upload, name='upload'),
]
