from liftapp import views
from django.urls import path

urlpatterns = [
    path('', views.hello_world, name='Hello world')

]