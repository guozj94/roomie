from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

import os
import json


def uploadpath(instance, filename):
    path = "roomie/static/roomie/img_user"
    format = str(instance.user_id) + '.' +(instance.content_type).split('/')[-1]
    return os.path.join(path, format)


# def upload_rename(instance, filename):
#     path = "images/"
#     format = str(instance.user_id) + '.' +(instance.content_type).split('/')[-1]
#     return os.path.join(path, format)


class Profile(models.Model):
    # GENDER_CHOICES = (
    #     ('Male', 'Male'),
    #     ('Female', 'Female'),
    # )
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    # age = models.IntegerField(blank=True, null=True)
    nationality = models.CharField(max_length=50, blank=True, null=True)
    program = models.CharField(max_length=50, blank=True, null=True)
    tags = models.CharField(max_length=200, blank=True, null=True)
    picture = models.FileField(upload_to=uploadpath, blank=True, null=True)
    content_type = models.CharField(max_length=50, blank=True, null=True)
    matchAvailable = models.BooleanField(default=True, null=False)
    # The cases about matchAvailable:
    # 1. Show roomie list 2. Like user 3. Match group


    def __unicode__(self):
        return 'id=' + str(self.id)


class Property(models.Model):
    description = models.TextField(max_length=500, blank=True, null=True)
    address1 = models.TextField(max_length=100, blank=True, null=True)
    address2 = models.TextField(max_length=100, blank=True, null=True)
    address3 = models.TextField(max_length=100, blank=True, null=True)
    neighborhood = models.TextField(max_length=50, blank=True, null=True)
    name = models.TextField(max_length=100, blank=True, null=True)
    transport = models.TextField(max_length=500, blank=True, null=True)
    coordinates = models.TextField(max_length=30, blank=True, null=True)
    propertyPicture = models.TextField(max_length=500, blank=True, null=True)
    content_type = models.CharField(max_length=50, blank=True, null=True)
    # If getting all liked property from user object, use user.property_set().all()
    likedUsers = models.ManyToManyField(User, null=True, blank=True) 

    def __unicode__(self):
        return 'id=' + str(self.id)


class FloorPlan(models.Model):
    floorPlanPicture = models.FileField(upload_to=uploadpath, blank=True, null=True)
    content_type = models.CharField(max_length=50, blank=True, null=True)
    name = models.TextField(max_length=500)
    sqMeters = models.IntegerField(blank=True, null=True)
    price = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True)
    property = models.ForeignKey(Property, null=False, blank=False, on_delete=models.CASCADE)

    def __unicode__(self):
        return 'name=' + str(self.name)


class Group(models.Model):
    name = models.CharField(default='Roomie Group', max_length=128)
    members = models.ManyToManyField(User, through='Membership', related_name='group')
    createdTime = models.DateTimeField(auto_now_add=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    addRoomieGroup = models.BooleanField(default=False, null=False, blank=False)
    confirmGroup = models.BooleanField(default=False, null=False, blank=False)


    def __unicode__(self):
        return 'id=' + str(self.id)


class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='membership')
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    alias = models.TextField(max_length=30, blank=True, null=True)
    joinedTime = models.DateTimeField(auto_now_add=True)
    settings = models.TextField(default='no', max_length=500, blank=True, null=True)
    addRoomieMember = models.BooleanField(default=False, null=False, blank=False)
    confirmMember = models.BooleanField(default=False, null=False, blank=False)

    def __unicode__(self):
        return 'id=' + str(self.id)

        
class Chats(models.Model):
    group = models.ForeignKey(Group)
    user = models.ForeignKey(User)
    text = models.TextField(max_length=500, blank=True, null=True)
    time = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return 'id=' + str(self.id)



class UserSettings(models.Model):
    group = models.ForeignKey(Group)
    settings = models.TextField(max_length=500, blank=True, null=True)

    def setsettings(self, x):
        self.settings = json.dumps(x)

    def getsettings(self):
        return json.loads(self.settings)

    def __unicode__(self):
        return 'id=' + str(self.id)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()



class Likes(models.Model):
    following_user = models.ForeignKey(User, related_name='likes_as_following')
    followed_user = models.ForeignKey(User, related_name='likes_as_followed')
    likeTime = models.DateTimeField(auto_now_add=True)
    relation = models.BooleanField(default=True, null=False, blank=False)
    property = models.ForeignKey(Property, null=False, blank=False, on_delete=models.CASCADE)


    def __unicode__(self):
        return 'id=' + str(self.id) 


class Likes_Group(models.Model):
    following_user = models.ForeignKey(User, related_name='likes_group_as_following')
    followed_group = models.ForeignKey(Group, related_name='likes_group_as_followed')
    likeTime = models.DateTimeField(auto_now_add=True)
    relation = models.BooleanField(default=True, null=False, blank=False)
    property = models.ForeignKey(Property, null=False, blank=False, on_delete=models.CASCADE)

    def __unicode__(self):
        return 'id=' + str(self.id) 


