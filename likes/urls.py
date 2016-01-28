from django.conf.urls import patterns, url
from . import views

urlpatterns = patterns('',
                       url(r'^likes/(?P<pic_id>[\d]+)/$', views.get_likes, name='get_likes'),
                       url(r'^addlike/$', views.add_like, name='add_comment'))
