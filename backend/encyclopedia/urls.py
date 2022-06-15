from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:entry>/", views.pages, name="pages"),
    path("search/", views.search, name="search"),
    path("create/", views.create, name="create"),
    path("random/", views.get_random, name="random"),
    path("wiki/<str:entry>/edit/", views.edit, name="edit"),
    path("wiki/<str:entry>/saved/", views.saved, name="saved"),
]