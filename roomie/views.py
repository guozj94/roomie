from django.http import HttpResponse, Http404
from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from django.db import transaction
from django.contrib import messages
from django.core import serializers
from django.views.decorators.csrf import ensure_csrf_cookie
from roomie.models import Profile, FloorPlan, Property, Group, Membership, Chats, UserSettings, Likes, Likes_Group
from roomie.forms import RegistrationForm, profileForm, PictureForm
from datetime import datetime
from django.db.models import Q
import time
import json
import sys
import os
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail

# from storages.backends.s3boto import S3BotoStorage
from django.conf import settings
from django.template.loader import render_to_string


# class MediaStorage(S3BotoStorage):
#        location = settings.MEDIAFILES_LOCATION

# DEBUG = True

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@transaction.atomic
@login_required
def profile(request):
    context = {}
    if request.method == 'POST':
        profile = Profile.objects.filter(user_id=request.user.id)[0]
        profile_form = profileForm(request.POST, instance=profile)
        if not profile_form.is_valid():
            # If not valid, 
            context['profile_form'] = profile_form
            return redirect(reverse('profile'))
        else:
            # Must copy content_type into a new model field because the model
            # FileField will not store this in the database.  (The uploaded file
            # is actually a different object than what's return from a DB read.)
            profile_form.save()
            context['message_profile'] = 'Your picture has been uploaded successfully!'
            context['profile_form'] = profileForm()
            return redirect(reverse('searchproperty'))

    elif request.method == 'GET':
        context['egs_program'] = ['Computer Science', 'Robotics', 'Art', 'Math']
        context['egs_gender'] = ['Female', 'Male']
        context['egs_nation'] = ['China', 'India', 'United States']
        context['egs_tags'] = ['Early bird', 'Late owl']

        profile = Profile.objects.filter(user_id=request.user.id)[0]
        profile_form = profileForm(instance=profile)
        context['profile_form'] = profile_form

        return render(request, 'roomie/profile.html', context)


@transaction.atomic
def user_setting(request):
    context = {}
    if request.method == 'POST':
        context = {}
        # try:
        setting_text = request.POST['setting_text']
        setting = UserSettings.objects.filter()
        if len(content) > 0 and len(content) <= 160:
            comment = Comment()
            comment.feed_id = int(request.POST['feed_id'])
            comment.user_id = int(request.user.id)
            comment.date = datetime.now()
            comment.content = content
            comment.save()
            print 'save succeeds'
        return redirect(reverse('user_setting'))
    else:
        return render(request, 'roomie/user_setting.html', context)


@transaction.atomic
@login_required
def add_picture(request):
    if request.method == 'POST':
        context = {}
        profile = Profile.objects.filter(user=request.user)[0]
        try:
            form = PictureForm(request.POST, request.FILES, instance=profile)
            if not form.is_valid():
                context['form'] = form
                console.log("Fail to upload picture")
            else:
                # Must copy content_type into a new model field because the model
                # FileField will not store this in the database.  (The uploaded file
                # is actually a different object than what's return from a DB read.)
                profile.content_type = form.cleaned_data['picture'].content_type
                form.save()
                context['message'] = 'Your picture has been uploaded successfully!'
                context['form'] = PictureForm()
            return redirect('profile')
        except:
            return redirect('profile')
    else:
        return redirect('profile')


@transaction.atomic
@login_required
def get_picture(request, id):
    user = get_object_or_404(User, id=id)
    if not user.profile.picture:
        raise Http404
    return HttpResponse(user.profile.picture, content_type=user.profile.content_type)


@transaction.atomic
def register(request):
    context = {}

    # Just display the registration form if this is a GET request.
    if request.method == 'GET':
        context['form'] = RegistrationForm()
        # print context['form']
        return render(request, 'roomie/register.html', context)

    # Creates a bound form from the request POST parameters and makes the 
    # form available in the request context dictionary.
    form = RegistrationForm(request.POST)
    context['form'] = form

    # Validates the form.
    if not form.is_valid():
        error_msg = "Your information is not valid, please try again with a new one."
        context['error_msg'] = error_msg
        return render(request, 'roomie/register.html', context)

    # At this point, the form data is valid.  Register and login the user.
    new_user = User.objects.create_user(username=form.cleaned_data['username'],
                                        password=form.cleaned_data['password1'],
                                        first_name=form.cleaned_data['first_name'],
                                        last_name=form.cleaned_data['last_name'],
                                        email=form.cleaned_data['email'])
    # Mark the user as inactive to prevent login before email confirmation.
    # Default = False if using mail identification.
    new_user.is_active = True
    # new_user.is_active = False
    new_user.save()

    # # Generate a one-time use token and an email message body
    token = default_token_generator.make_token(new_user)

    email_body = """
        Welcome to the Roomie Websites.  Please click the link below to
        verify your email address and complete the registration of your account:
          http://%s%s
        """ % (request.get_host(),
               reverse('confirm', args=(new_user.username, token)))

    send_mail(subject="Verify your email address",
              message=email_body,
              from_email="roomie.customerservice@gmail.com",
              recipient_list=[new_user.email])

    context['email'] = form.cleaned_data['email']

    return render(request, 'roomie/needs-confirmation.html', context)

    new_user = authenticate(username=request.POST['username'],
                            password=request.POST['password1'])
    login(request, new_user)
    return redirect(reverse('profile'))


@transaction.atomic
def confirm_registration(request, username, token):
    user = get_object_or_404(User, username=username)

    # Send 404 error if token is invalid
    if not default_token_generator.check_token(user, token):
        raise Http404

    # Otherwise token was valid, activate the user.
    user.is_active = True
    user.save()
    return render(request, 'roomie/confirmed.html', {})


@login_required
@ensure_csrf_cookie
def searchproperty(request):
    try:
        profile = get_object_or_404(Profile, user=request.user)
        if not profile.gender or not profile.nationality or not profile.program or not profile.tags:
            context = {}
            context['egs_program'] = ['Computer Science', 'Design', 'Engineering', 'Humanity']
            context['egs_gender'] = ['Female', 'Male']
            context['egs_nation'] = ['United States', 'China', 'India', 'Germany']
            context['egs_tags'] = ['Early bird', 'Late owl']

            profile = Profile.objects.filter(user_id=request.user.id)[0]
            profile_form = profileForm(instance=profile)
            context['profile_form'] = profile_form
            return render(request, 'roomie/profile.html', context)
        pass
    except:
        return render(request, 'roomie/profile.html', {})
    context = {}
    try:
        context['properties'] = Property.objects.all()
        return render(request, 'roomie/searchproperty.html', context)
    except:
        return render(request, 'roomie/searchproperty.html', context)


@login_required
@ensure_csrf_cookie
def searchproperty_getresults(request):
    try:
        all_properties = Property.objects.all()
        tryjson = []
        user_id = request.user.id
        print all_properties
        for x in all_properties:
            floorplans_to_x = x.floorplan_set.all()
            likedusers_to_x = x.likedUsers.all()
            minSqMeters = sys.maxint
            minPrice = sys.maxint
            if_liked = 'FALSE'
            floorplans = []
            for y in floorplans_to_x:
                if minPrice > y.price:
                    minPrice = y.price
                    minSqMeters = y.sqMeters
            for z in likedusers_to_x:
                if user_id == z.id:
                    if_liked = 'TRUE'
            propertyPicUrl = '../../' + x.propertyPicture
            a = {'propertyPictureURL': propertyPicUrl, 'neighborhood': x.neighborhood, 'name': x.name,
                 'likes': x.likedUsers.count(),
                 'price': minPrice, 'sqft': minSqMeters, 'id': x.id, 'if_liked': if_liked}
            tryjson.append(a)
        print "HERE"
        jsonobj = json.dumps(tryjson, cls=DjangoJSONEncoder)
        print jsonobj
        return HttpResponse(jsonobj, content_type='application/json')
    except:
        return HttpResponse({}, content_type='application/json')


@login_required
@ensure_csrf_cookie
def searchproperty_searchresults(request):
    try:
        searchText = request.GET.get("keyword", False)
        # all_properties = Property.objects.filter(Q(description__icontains=searchText) | Q(name__icontains=searchText))

        all_properties = Property.objects.filter(name__contains=searchText)
        tryjson = []
        user_id = request.user.id
        for x in all_properties:
            floorplans_to_x = x.floorplan_set.all()
            likedusers_to_x = x.likedUsers.all()
            minSqMeters = sys.maxint
            minPrice = sys.maxint
            if_liked = 'FALSE'
            floorplans = []
            for y in floorplans_to_x:
                if minPrice > y.price:
                    minPrice = y.price
                    minSqMeters = y.sqMeters
            for z in likedusers_to_x:
                if user_id == z.id:
                    if_liked = 'TRUE'
            propertyPicUrl = '../../' + x.propertyPicture
            a = {'propertyPictureURL': propertyPicUrl, 'neighborhood': x.neighborhood, 'name': x.name,
                 'likes': x.likedUsers.count(),
                 'price': minPrice, 'sqft': minSqMeters, 'id': x.id, 'if_liked': if_liked}
            tryjson.append(a)
        jsonobj = json.dumps(tryjson, cls=DjangoJSONEncoder)
        print jsonobj
        return HttpResponse(jsonobj, content_type='application/json')
    except:
        return HttpResponse({}, content_type='application/json')


@login_required
@ensure_csrf_cookie
def likedproperty(request):
    context = {}
    try:
        context['properties'] = Property.objects.all()
        return render(request, 'roomie/likedproperty.html', context)
    except:
        return render(request, 'roomie/likedproperty.html', context)


@login_required
@ensure_csrf_cookie
def likedproperty_getresults(request):
    try:
        user_id = request.user.id
        user1 = User.objects.get(id=user_id)
        all_properties = Property.objects.filter(likedUsers=user1)
        tryjson = []
        user_id = request.user.id
        for x in all_properties:
            floorplans_to_x = x.floorplan_set.all()
            minSqMeters = sys.maxint
            minPrice = sys.maxint
            floorplans = []
            for y in floorplans_to_x:
                if minPrice > y.price:
                    minPrice = y.price
                    minSqMeters = y.sqMeters
            propertyPicUrl = '../../' + x.propertyPicture
            a = {'propertyPictureURL': propertyPicUrl, 'neighborhood': x.neighborhood, 'name': x.name,
                 'likes': x.likedUsers.count(),
                 'price': minPrice, 'sqft': minSqMeters, 'id': x.id, 'if_liked': 'TRUE'}
            tryjson.append(a)
        jsonobj = json.dumps(tryjson, cls=DjangoJSONEncoder)
        # print jsonobj
        return HttpResponse(jsonobj, content_type='application/json')
    except:
        return HttpResponse({}, content_type='application/json')


@login_required
@ensure_csrf_cookie
def likedpropertydetail(request, property_id):
    context = {}  # property_id = request.POST.get('propertyid', False)
    floorplans = FloorPlan.objects.filter(property=property_id).values('floorPlanPicture', 'content_type', 'name',
                                                                       'sqMeters', 'price')
    for f in floorplans:
            f['floorPlanPicture'] = '../../' + f['floorPlanPicture']
    context['floorplans'] = floorplans
    propertyInfo = Property.objects.filter(id=property_id).values('description', 'neighborhood', 'address1',
                                                                  'address2', 'address3',
                                                                  'name', 'transport', 'coordinates',
                                                                  'propertyPicture',
                                                                  'content_type', 'likedUsers')
    for p in propertyInfo:
            p['propertyPicture'] = '../../' + p['propertyPicture']
    context['propertyInfo'] = propertyInfo[0]
    _property = Property.objects.get(id=property_id)
    likedUsers = _property.likedUsers.all()
    if_liked = "FALSE"
    for x in likedUsers:
        if request.user.id == x.id:
            if_liked = 'TRUE'
    print _property
    minPrice = sys.maxint
    for i in floorplans:
        print i['price']
        if i['price'] < minPrice:
            minPrice = i['price']
    context['minPrice'] = '+$' + str(minPrice)[:-3] + '/mo'
    context['if_liked'] = if_liked
    context['property_id'] = property_id
    # [Roomie Filter]
    roomie_filter = {'gender': 'All', 'nationality': 'All'}

    #  Click the button of like or cancel
    if request.method == 'POST':
        if 'like' in request.POST:
            like = Likes()
            like.following_user = request.user
            like.followed_user = request.POST['liked_user']
            like.save()
            redirect(reverse('likedpropertydetail'))

        elif 'dislike' in request.POST:
            dislike = likes()
            dislike.following_user = request.user
            dislike.followed_user = request.POST['liked_user']
            dislike.save()
            redirect(reverse('likedpropertydetail'))

        elif 'liked_roomie_group_id' in request.POST:

            group = Group.objects.get(id=request.POST['liked_roomie_group_id'])
            like_group(request, request.user, group)
            redirect(reverse('likedpropertydetail'))

        elif 'disliked_roomie_group_id' in request.POST:
            group = Group.objects.get(id=request.POST['disliked_roomie_group_id'])
            dislike_group(request, request.user, group)
            redirect(reverse('likedpropertydetail'))

        if 'filter_gender' in request.POST:
            roomie_filter['gender'] = request.POST['filter_gender']
        if 'filter_nationality' in request.POST:
            roomie_filter['nationality'] = request.POST['filter_nationality']

    _property = Property.objects.get(id=property_id)
    context['filter'] = roomie_filter
    # ------------------------------
    # [Roomie]
    excludeUsers = Likes.objects.filter(following_user=request.user, property=_property)
    exclude_user_id_list = []
    for exUser in excludeUsers:
        exclude_user_id_list.append(exUser.followed_user.id)

    # likedUsers = User.objects.filter(profile__matchAvailable=True).exclude(id=request.user.id).exclude(id__in=exclude_user_id_list)
    # [DEBUG]
    likedUsers = _property.likedUsers.filter(profile__matchAvailable=True).exclude(id=request.user.id).exclude(
        id__in=exclude_user_id_list)

    # user filter
    # if roomie_filter['gender'] != 'All':
    #     likedUsers = likedUsers.filter(profile__gender=roomie_filter['gender'])
    # if roomie_filter['nationality'] != 'All':
    #     likedUsers = likedUsers.filter(profile__nationality=roomie_filter['nationality'])

    likedUsers_processed = []
    for like_User in likedUsers:
        tags = like_User.profile.tags
        if tags is not None:
            tags = tags.split(',')
        likedUsers_processed.append(
            {'profile': like_User.profile, 'first_name': like_User.first_name, 'last_name': like_User.last_name,
             'id': like_User.id,
             'gender': like_User.profile.gender, 'nationality': like_User.profile.nationality,
             'program': like_User.profile.program, 'tags': tags})

    # ------------------------------
    # [Roomie Group]

    excludeGroups = Likes_Group.objects.filter(following_user=request.user, property=_property)
    exclude_group_id_list = []
    for exGroup in excludeGroups:
        exclude_group_id_list.append(exGroup.followed_group.id)

    waitingGroups = Group.objects.filter(confirmGroup=False, addRoomieGroup=True).exclude(
        members__in=[request.user]).exclude(id__in=exclude_group_id_list)

    waitingGroupsInfoset = []
    for waitinggroup in waitingGroups:
        members_processed = []
        for member in waitinggroup.members.all():
            tags = member.profile.tags
            if tags is not None:
                tags = tags.split(',')
            members_processed.append(
                {'profile': member.profile, 'first_name': member.first_name, 'last_name': member.last_name,
                 'id': member.id,
                 'gender': member.profile.gender, 'nationality': member.profile.nationality,
                 'program': member.profile.program, 'tags': tags})

        waitingGroupsInfoset.append({'group': waitinggroup, 'members': members_processed})

    context['waitingGroups'] = waitingGroupsInfoset
    context['likedUsers'] = likedUsers_processed
    print '------------------------------'
    print context['propertyInfo']
    print '------------------------------'
    return render(request, 'roomie/likedpropertydetail.html', context)


@login_required
@ensure_csrf_cookie
def propertydetail(request, property_id):
    context = {}
    try:
        # property_id = request.POST.get('propertyid', False)
        floorplans = FloorPlan.objects.filter(property=property_id).values('floorPlanPicture', 'content_type', 'name',
                                                                           'sqMeters', 'price')
        # print floorplans
        for f in floorplans:
            f['floorPlanPicture'] = '../../' + f['floorPlanPicture']
        context['floorplans'] = floorplans
        propertyInfo = Property.objects.filter(id=property_id).values('description', 'neighborhood', 'address1',
                                                                      'address2', 'address3',
                                                                      'name', 'transport', 'coordinates',
                                                                      'propertyPicture',
                                                                      'content_type', 'likedUsers')
        for p in propertyInfo:
            p['propertyPicture'] = '../../' + p['propertyPicture']
        context['propertyInfo'] = propertyInfo[0]
        print context['propertyInfo']
        _property = Property.objects.get(id=property_id)
        likedUsers = _property.likedUsers.all()
        if_liked = "FALSE"
        for x in likedUsers:
            if request.user.id == x.id:
                if_liked = 'TRUE'
        minPrice = sys.maxint
        for i in floorplans:
            print i['price']
            if i['price'] < minPrice:
                minPrice = i['price']
        context['minPrice'] = '+$' + str(minPrice)[:-3] + '/mo'
        context['if_liked'] = if_liked
        context['property_id'] = property_id
        return render(request, 'roomie/propertydetail.html', context)
    except:
        return render(request, 'roomie/propertydetail.html', context)


@login_required
@ensure_csrf_cookie
def likedpropertydetail_json(request):
    try:
        if request.method == "POST":
            # [DEBUG] still need to check 1.exist 2.input is right -> exception
            if 'liked_user_id' in request.POST:
                like_user(request)
            elif 'disliked_user_id' in request.POST:
                dislike_user(request)
            elif 'liked_roomie_group_id' in request.POST:
                group = Group.objects.get(id=request.POST['liked_roomie_group_id'])
                like_group(request, request.user, group)
            elif 'disliked_roomie_group_id' in request.POST:
                group = Group.objects.get(id=request.POST['disliked_roomie_group_id'])
                dislike_group(request, request.user, group)

        data = []
        obj_json = json.dumps(data, cls=DjangoJSONEncoder)
        print obj_json
        return HttpResponse(obj_json, content_type='application/json')
    except:
        raise
        return HttpResponse({}, content_type='application/json')


@login_required
@transaction.atomic
def like_user_kernel(request):
    like = Likes()
    like.followed_user = User.objects.get(id=request.POST['liked_user_id'])
    like.following_user = request.user
    like.relation = True
    property = Property.objects.get(id=request.POST['propertyid'])
    like.property = property
    like.save()


@login_required
@transaction.atomic
def dislike_user(request):
    dislike = Likes()
    dislike.followed_user = User.objects.get(id=request.POST['disliked_user_id'])
    dislike.following_user = request.user
    dislike.relation = False
    property = Property.objects.get(id=request.POST['propertyid'])
    dislike.property = property
    dislike.save()


# Match Event 1
@login_required
@transaction.atomic
def like_user(request):
    # Step 1
    like_user_kernel(request)

    # Step 2
    followed_user = User.objects.get(id=request.POST['liked_user_id'])
    following_user = request.user

    # [Check] modify back
    property = Property.objects.get(id=request.POST['propertyid'])
    # property = Property.objects.get(id=request.POST['property_id'])

    count = Likes.objects.filter(following_user=followed_user, followed_user=following_user, relation=1,
                                 property=property).count()
    if count > 0:
        group = create_group(request, followed_user, following_user, property)
        like_group_kernel(request, followed_user, group)
        like_group_kernel(request, following_user, group)
        # [DEBUG]
        send_email_notif(request, following_user, 'group_match')
        send_email_notif(request, followed_user, 'group_match')

    # Step 3 
    possible_groups = Group.objects.filter(members__in=[following_user])
    for pos_group in possible_groups:
        # if following_user has liked the group
        count = Likes_Group.objects.filter(following_user=followed_user, followed_group=pos_group,
                                           relation=True).count()
        if count > 0:
            flag_match = check_group_like_one(request, followed_user, pos_group)
            if flag_match:
                adduser_group(request, followed_user, pos_group)
                # [DEBUG]
                for member in pos_group.members.all():

                    # if member.settings == 'no' or member is None:
                    #     pass
                    # else:
                    send_email_notif(request, member, 'new_member')

                    # membership = Membership.objects.get(user=member, group=pos_group)
                    # if membership.settings == 'no' or membership is None:
                    #     pass
                    # else:
                    #     send_email_notif(request, membership, 'new_member')


    # Step 4: send email notification
    send_email_notif(request, followed_user, 'like')


# Match Event 2
@login_required
@transaction.atomic
def like_group(request, new_member, group):
    # Step 1
    like_group_kernel(request, new_member, group)

    # Step 2
    flag_match = check_group_like_one(request, new_member, group)
    if flag_match:
        adduser_group(request, new_member, group)

    # Step 3: notify group member
    for member in group.members.all():

        # if member.settings == 'no' or member is None:
        #     pass
        # else:
        send_email_notif(request, member, 'like_group')

        # membership = Membership.objects.get(user=member, group=group)

        # if membership.settings == 'no' or membership is None:
        #     pass
        # else:
        #     send_email_notif(request, membership, 'like_group')



@login_required
@transaction.atomic
def like_group_kernel(request, following_user, group):
    like_group_rel = Likes_Group()
    like_group_rel.following_user = following_user
    like_group_rel.followed_group = group
    like_group_rel.relation = True
    property = Property.objects.get(id=request.POST['propertyid'])
    like_group_rel.property = property
    like_group_rel.save()


# Match Event 3
@login_required
@transaction.atomic
def dislike_group(request, new_member, group):
    # Step 1
    dislike_group_kernel(request, new_member, group)


@login_required
@transaction.atomic
def dislike_group_kernel(request, following_user, group):
    dislike_group_rel = Likes_Group()
    dislike_group_rel.following_user = following_user
    dislike_group_rel.followed_group = group
    dislike_group_rel.relation = False
    property = Property.objects.get(id=request.POST['propertyid'])
    dislike_group_rel.property = property
    dislike_group_rel.save()


@login_required
@transaction.atomic
def quit_group_and_reload(request):
    quitting_member = request.user
    quitting_group_id = request.POST['groupid']
    quitting_group = Group.objects.get(id=quitting_group_id)
    quit_group(request, quitting_member, quitting_group)
    print "quit!"
    data = []
    obj_json = json.dumps(data, cls=DjangoJSONEncoder)
    return HttpResponse(obj_json, content_type='application/json')


# Match Event 4
@login_required
@transaction.atomic
def quit_group(request, quitting_member, quitting_group):
    property = Property.objects.get(id=request.POST['propertyid'])

    # Step 1: delete 'user like group' in {Likes_Group}
    like_group_to_delelte = Likes_Group.objects.get(following_user=quitting_member, followed_group=quitting_group)
    like_group_to_delelte.delete()

    # Step 2: delete 'user from group' in {Group} 
    member_to_remove = Membership.objects.get(user=quitting_member, group=quitting_group)
    member_to_remove.delete()

    # Step 3: delete every like relation between user and other members in {Like}
    other_members = Membership.objects.filter(group=quitting_group)

    for member in other_members:
        like_to_cancel = Likes.objects.get(following_user=quitting_member, followed_user=member.user, property=property)
        like_to_cancel.delete()

    # Step 4: send email notificaions to other members
    # [DEBUG]
    for member in other_members:
        # if member.settings == 'no' or member is None:
        #     pass
        # else:
        send_email_notif(request, member.user, 'member_quit')

    # Step 5: check if group is empty, so just delete group too
    group_size = Membership.objects.filter(group=quitting_group).count()
    if group_size == 0:
        delete_group_relations(request, quitting_group)
        quitting_group.delete()


@login_required
@transaction.atomic
def delete_group_relations(request, quitting_group):
    group_relations = Likes_Group.objects.filter(followed_group=quitting_group)
    for gr in group_relations:
        gr.delete()


@login_required
@transaction.atomic
def create_group(request, member_A, member_B, property):
    new_group = Group()
    new_group.property = property
    new_group.save()
    Membership.objects.create(user=member_A, group=new_group)
    Membership.objects.create(user=member_B, group=new_group)

    return new_group


@login_required
@transaction.atomic
def adduser_group(request, following_user, group):
    Membership.objects.create(user=following_user, group=group)


@login_required
@transaction.atomic
def check_group_like_one(request, new_member, group):
    flag_match = True
    members = group.members.all()
    if members.count() == 0:
        flag_match = False
    else:
        property_id = request.POST.get('propertyid', False)
        property = Property.objects.get(id=property_id)
        for member in members:
            count = Likes.objects.filter(following_user=member, followed_user=new_member, relation=1,
                                         property=property).count()
            if count == 0:
                flag_match = False
    return flag_match


@login_required
@ensure_csrf_cookie
def updatelikedb(request):
    try:
        property_id = request.POST.get('property_id', False)
        if_liked = request.POST.get('like', False)
        user_id = request.user.id
        property1 = Property.objects.get(id=property_id)
        user1 = User.objects.get(id=user_id)
        tryjson = []
        if if_liked == 'TRUE':
            property1.likedUsers.add(user1)
            property1.save()
        else:
            property1.likedUsers.remove(user1)
            property1.save()
        a = {'success': True}
        tryjson.append(a)
        jsonobj = json.dumps(tryjson, cls=DjangoJSONEncoder)
        print jsonobj
        return HttpResponse(jsonobj, content_type='application/json')
    except:
        return HttpResponse({}, content_type='application/json')


@login_required
@ensure_csrf_cookie
def chatroom_basic(request):
    return render(request, 'roomie/chatroom.html', {})


@login_required
@ensure_csrf_cookie
def getChats(request):
    group_id = request.GET['groupid']
    chats = Chats.objects.filter(group=group_id).order_by('time')
    jsonobj = serializers.serialize('json', chats)
    # print jsonobj
    return HttpResponse(jsonobj, content_type='application/json')


@login_required
@ensure_csrf_cookie
def writeChat(request):
    group_id = request.POST['groupid']
    content = request.POST['text']
    chat = Chats()
    chat.group = Group.objects.get(id=group_id)
    chat.user = request.user
    chat.text = content
    # print chat.text
    chat.save()
    data = []
    obj_json = json.dumps(data, cls=DjangoJSONEncoder)
    return HttpResponse(obj_json, content_type='application/json')


@login_required
@ensure_csrf_cookie
def getContacts(request):
    contacts = Group.objects.filter(members__in=[request.user]).order_by('property')
    # print contacts
    tryjson = []
    for contact in contacts:
        members = contact.members.all()
        memberid = []
        membername = []
        for member in members:
            memberid.append(member.id)
            membername.append(member.first_name)
        context = {'id': contact.id, 'membersid': memberid, 'membersname': membername,
                   'propertyid': contact.property.id, 'propertyname': contact.property.name}
        tryjson.append(context)
    jsonobj = json.dumps(tryjson, cls=DjangoJSONEncoder)
    print jsonobj
    return HttpResponse(jsonobj, content_type='application/json')


@login_required
@ensure_csrf_cookie
@transaction.atomic
def changeNotification(request):
    targetGroupId = request.POST.get('id', False)
    target = get_object_or_404(Membership, user=request.user, group__id=targetGroupId)
    target.settings = request.POST.get('notification', False)
    target.joinedTime = datetime.now()
    target.save()
    data = []
    obj_json = json.dumps(data, cls=DjangoJSONEncoder)
    return HttpResponse(obj_json, content_type='application/json')


# [DEBUG: all functions about add and confirm roomie]
@login_required
@ensure_csrf_cookie
@transaction.atomic
def open_add_roomie(request):
    # Logic Explanation:
    # 1. Only when all group members want 'add_roomie', the group will be open for new members
    # 2. If the group is open: open group 'addRoomie'
    print "start add roomie"
    groupId = request.POST.get('groupid', False)
    targetGroup = get_object_or_404(Group, id=groupId)
    targetUser = request.user
    member = get_object_or_404(Membership, user=targetUser, group=targetGroup)
    member.addRoomieMember = True
    member.save()
    print "finish add roomie"

    count = Membership.objects.filter(group=targetGroup, addRoomieMember=False).count()
    if count == 0:
        targetGroup.addRoomieGroup = True
        targetGroup.save()
    data = []
    obj_json = json.dumps(data, cls=DjangoJSONEncoder)
    return HttpResponse(obj_json, content_type='application/json')


@login_required
@ensure_csrf_cookie
@transaction.atomic
def close_add_roomie(request):
    # Logic Explanation:
    #   If one close 'add_roomie', the group and all members close in the same time
    groupId = request.POST.get('groupid', False)
    targetGroup = get_object_or_404(Group, id=groupId)
    targetUser = request.user

    targetGroup.addRoomieGroup = False
    targetGroup.save()

    for member in Membership.objects.filter(group=targetGroup):
        member.addRoomieMember = False
        member.save()


@login_required
@ensure_csrf_cookie
@transaction.atomic
def confirm_roomie(request):
    # Logic Explanation:
    # 1. Only when all group members confirm, the group will be confirmed
    # 2. If the group is confirmed:
    #   (1) close group 'addRoomie' and 'confirmed'
    #   (2) close all members 'matchavailable'
    #   (3) members auto quit all groups(including removing 'likes' relation)

    groupId = request.POST.get('groupid', False)
    targetGroup = get_object_or_404(Group, id=groupId)
    targetUser = request.user
    member = get_object_or_404(Membership, user=targetUser, group=targetGroup)
    member.confirmMember = True
    member.save()

    count = Membership.objects.filter(group=targetGroup, confirmMember=False).count()
    if count == 0:
        # Step 1: close group 'addRoomie' and 'confirmed'
        targetGroup.addRoomieGroup = False
        targetGroup.confirmGroup = True
        targetGroup.save()

        # Step 2: close all members 'matchavailable'
        for mem in Membership.objects.filter(group=targetGroup):
            mem.user.matchAvailable = False
            mem.save()
            # Step 3: members auto quit all groups(including removing 'likes' relation)
            # [DEBUG]
            for otherGroup in Group.objects.filter(members__in=[mem.user]):
                quit_group(request, mem.user, otherGroup)

            # Step 3: email notifications
            # [DEBUG]
            send_email_notif(request, mem.user, 'group_confirm')
    data = []
    obj_json = json.dumps(data, cls=DjangoJSONEncoder)
    return HttpResponse(obj_json, content_type='application/json')


# @ensure_csrf_cookie
def send_email_notif(request, receiver_user, notif_type):
    host_email = "roomie.customerservice@gmail.com"
    email_body = ""
    subject_title = ""
    token = default_token_generator.make_token(receiver_user)

    # notif_type: 0.like  1. match people 2. new member 3. someone quit 4.group add new member 5.group confirm new member
    if notif_type == "like":
        subject_title = "%s, someone likes you!" % (receiver_user.last_name)
        email_body = "One roomie just likes you on Roomie, just click on the link and have a look at it! \n %s%s" % (
        request.get_host(), reverse('confirm', args=(receiver_user.username, token)))
    elif notif_type == "like_group":
        subject_title = "%s, someone likes your group!" % (receiver_user.last_name)
        email_body = "One roomie just likes your group on Roomie, just click on the link and have a look at it! \n %s%s" % (
        request.get_host(), reverse('confirm', args=(receiver_user.username, token)))
    elif notif_type == "group_match":
        subject_title = "%s, you have a new group!" % (receiver_user.last_name)
        email_body = "You have joined in a new group on Roomie, just click on the link and have a look at it! \n %s%s" % (
        request.get_host(), reverse('confirm', args=(receiver_user.username, token)))
    elif notif_type == "new_member":
        subject_title = "%s, your group get new member!" % (receiver_user.last_name)
        email_body = "You have got new member in your group, just click on the link and have a look at it! \n %s%s" % (
        request.get_host(), reverse('confirm', args=(receiver_user.username, token)))
    elif notif_type == "member_quit":
        subject_title = "%s, someone quits from your group." % (receiver_user.last_name)
        email_body = "A member in your group have quitted, just click on the link and have a look at it. \n %s%s" % (
        request.get_host(), reverse('confirm', args=(receiver_user.username, token)))
    elif notif_type == "group_confirm":
        subject_title = "%s, you should prepare to live with your roomies!" % (receiver_user.last_name)
        email_body = "All members in your group has confirmed to become roomie, just click on the link and have a look at it! \n %s%s" % (
        request.get_host(), reverse('confirm', args=(receiver_user.username, token)))

    # Generate a one-time use token and an email message body

    send_mail(subject=subject_title,
              message=email_body,
              from_email=host_email,
              recipient_list=[receiver_user.email])

# @login_required
# @ensure_csrf_cookie
# @transaction.atomic
# def betray_roomie(request):

#     # Logic Explanation:
#     # 1. If one click to quit, every
#     # 2. If the group is confirmed:
#     #   (1) close group 'addRoomie' and 'confirmed'
#     #   (2) close all members 'matchavailable'
#     #   (3) members auto quit all groups(including removing 'likes' relation)

#     # Step 1: close group 'addRoomie'
#     groupId = request.POST.get('group_id', False)
#     group = get_object_or_404(Group, id=groupId)
#     group.addRoomie = False
#     group.save()

#     # Step 2: close users 'matchAvailable'
#     members = group.members.all()
#     for mem in members:
#         mem.matchAvailable = False
#         mem.save()

#     # Step 3: close users 'matchAvailable'


# @login_required
# @ensure_csrf_cookie
# @transaction.atomic
# def userAvailbleCheck(request):
# pass

# AWS_HEADERS = {  # see http://developer.yahoo.com/performance/rules.html#expires
#         'Expires': 'Thu, 31 Dec 2099 20:00:00 GMT',
#         'Cache-Control': 'max-age=94608000',
# }


# # Tell django-storages that when coming up with the URL for an item in S3 storage, keep
# # it simple - just use this domain plus the path. (If this isn't set, things get complicated).
# # This controls how the `static` template tag from `staticfiles` gets expanded, if you're using it.
# # We also use it in the next setting.
# AWS_S3_CUSTOM_DOMAIN = '%s.s3.amazonaws.com' % AWS_STORAGE_BUCKET_NAME

# # This is used by the `static` template tag from `static`, if you're using that. Or if anything else
# # refers directly to STATIC_URL. So it's safest to always set it.

# # Tell the staticfiles app to use S3Boto storage when writing the collected static files (when
# # you run `collectstatic`).

# MEDIAFILES_LOCATION = 'media'
# MEDIA_URL = "https://%s/" % AWS_S3_CUSTOM_DOMAIN
# DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
