from django.shortcuts import render
from .models import Picture, Comment
from django.contrib.auth.models import User
from django_ajax.decorators import ajax
from django.http import HttpResponse
from django.http import JsonResponse
import json


def index(request):
    context_dict = {}
    try:
        pictures = Picture.objects.all()
        context_dict['pictures'] = pictures
    except Picture.DoesNotExist:
        pass

    return render(request, 'gallery.html', context_dict)


def modal_picture(request, pic_id):
    picture = Picture.objects.all().filter(pic_id=pic_id)
    if request.user.is_authenticated():
        comments = Comment.objects.filter(picture__pic_id=pic_id)
        context_dic = {'comments': comments, 'picture': picture}
        return render(request, 'modal_pic.html', context_dic)
    else:
        context_dic = {'picture': picture}
        return render(request, 'modal_pic.html', context_dic)


def get_comments(request, pic_id):
    if request.user.is_authenticated():
        comments = Comment.objects.filter(picture__pic_id=pic_id)
        new_comments = []
        for comment in comments:
            new_comments.append({'author': str(comment.user), 'text': str(comment.comment_body)})
        return JsonResponse({'comments': new_comments, 'is_auth': "1"})
    return JsonResponse({'is_auth': "0"})


def get_all_pictures(request):
    pictures = Picture.objects.all()
    new_pictures = {}
    for picture in pictures:
        new_pictures[str(picture.pic_id)] = [str(picture.preview_pic.url), str(picture.full_pic.url)]
    return JsonResponse(new_pictures)


def add_comment(request):
    if request.method == 'POST':
        new_comment = json.loads(request.body.decode('utf-8'))
        print(new_comment)
        if request.user.is_authenticated():
            picture = Picture.objects.get(pic_id=new_comment['picId'])
            c = Comment(comment_body=new_comment['comment'], user=request.user, picture=picture)
            c.save()
            return JsonResponse({'author': str(request.user), 'text': new_comment['comment']})
        else:
            return JsonResponse({'error': "user doesn't auth"})
    else:
        return JsonResponse({'error': 'only POST'})