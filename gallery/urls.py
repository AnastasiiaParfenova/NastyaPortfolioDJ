from django.conf.urls import patterns, url
from . import views

urlpatterns = patterns('',
                       url(r'^$', views.index, name='index'),
                       url(r'^pic/(?P<pic_id>[\d]+)/$', views.modal_picture, name='pic_id'),
                       url(r'^comments/(?P<pic_id>[\d]+)/$', views.get_comments, name='get_comments'),
                       url(r'^pictures/$', views.get_all_pictures, name='get_pictures'),
                       url(r'^addcomment/$', views.add_comment, name='add_comment'))
