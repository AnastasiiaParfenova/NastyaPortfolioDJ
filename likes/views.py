from django.shortcuts import render
from .models import Likes
from gallery.models import Picture, Comment
from django.http import JsonResponse
import json


def get_likes(request, pic_id):
    if request.user.is_authenticated():
        likes = Likes.objects.filter(picture__pic_id=pic_id, liked=1)
        curr_user_liked = Likes.objects.filter(picture__pic_id=pic_id, user=request.user, liked=1)
        return JsonResponse({'total_likes': len(likes), 'curr_user_liked': len(curr_user_liked), 'is_auth': "1"})
    return JsonResponse({'is_auth': "0"})


def add_like(request):
    if request.method == 'POST':
        new_like = json.loads(request.body.decode('utf-8'))
        print(new_like)
        if request.user.is_authenticated():
            if len(Likes.objects.filter(picture__pic_id=new_like['picId'], user=request.user, liked=1)) > 0:
                l = Likes.objects.get(picture__pic_id=new_like['picId'], user=request.user, liked=1)
                picture = Picture.objects.get(pic_id=new_like['picId'])
                l.liked = 0
                # l = Likes(liked=0, user=request.user, picture=picture)
                l.save()
                return JsonResponse({'state': '-1'})
            else:
                if len(Likes.objects.filter(picture__pic_id=new_like['picId'], user=request.user)) > 0:
                    l = Likes.objects.get(picture__pic_id=new_like['picId'], user=request.user)
                    l.liked = 1
                    l.save()
                else:
                    picture = Picture.objects.get(pic_id=new_like['picId'])
                    l = Likes(liked=1, user=request.user, picture=picture)
                    l.save()
                return JsonResponse({'state': '+1'})
        else:
            return JsonResponse({'error': "user doesn't auth"})
    else:
        return JsonResponse({'error': 'only POST'})
