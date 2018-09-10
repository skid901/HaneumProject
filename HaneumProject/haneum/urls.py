from django.urls import path

from . import views

app_name = 'haneum'
urlpatterns = [
    path('', views.index, name='index'),
    path('upload', views.upload, name='upload'),
    path('download', views.download, name='download'),
]
