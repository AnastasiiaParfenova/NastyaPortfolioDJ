from django.db import models
from django.contrib.auth.models import User

from hitcount.models import HitCountMixin


class Picture(models.Model, HitCountMixin):
    pic_id = models.IntegerField(unique=True)
    preview_pic = models.ImageField(upload_to='preview_pictures')
    full_pic = models.ImageField(upload_to='full_pictures')

    def __str__(self):
        return str(self.pic_id)


class Comment(models.Model, HitCountMixin):
    comment_body = models.TextField()
    user = models.ForeignKey(User)
    created_on = models.DateTimeField(auto_now_add=True)
    picture = models.ForeignKey(Picture)

    def __str__(self):
        return self.comment_body