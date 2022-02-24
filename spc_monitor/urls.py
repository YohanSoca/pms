from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('controller', views.controller,  name='controller'),
    path('auto_manual', views.auto_manual, name='auto_manual'),
    path('add_cmd', views.add_cmd, name='add_cmd'),
    path('get_status', views.get_status, name='get_status'),
    path('thruster_auto_manual', views.thruster_auto_manual, name='thruster_auto_manual')
]