from django.db import models
from django.contrib.auth.models import User
from gallery.models import Picture


class Likes(models.Model):
    liked = models.BooleanField(default=0)
    user = models.ForeignKey(User)
    picture = models.ForeignKey(Picture)

    def __str__(self):
        return str(self.user)
