from django import forms

from django.contrib.auth.models import User
from models import *




class RegistrationForm(forms.Form):

    # GENDER_CHOICES = (
    #     ('M', 'Male'),
    #     ('F', 'Female'),
    # )
    
    first_name = forms.CharField(max_length=20, label='', widget=forms.TextInput(attrs={'placeholder': 'First Name'}))
    last_name  = forms.CharField(max_length=20, label='', widget=forms.TextInput(attrs={'placeholder': 'Last Name'}))
    email      = forms.CharField(max_length=50,
                                 label='',
                                 widget = forms.EmailInput(attrs={'placeholder':"Email"}))
    username   = forms.CharField(max_length = 20, label='', widget=forms.TextInput(attrs={'placeholder': 'Username'}))
    password1  = forms.CharField(max_length = 200, 
                                 label='', 
                                 widget = forms.PasswordInput(attrs={'placeholder':"Password"}))
    password2  = forms.CharField(max_length = 200, 
                                 label='',  
                                 widget = forms.PasswordInput(attrs={'placeholder':"Confirm password"}))

    # Customizes form validation for properties that apply to more
    # than one field.  Overrides the forms.Form.clean function.
    def clean(self):
        # Calls our parent (forms.Form) .clean function, gets a dictionary
        # of cleaned data as a result
        cleaned_data = super(RegistrationForm, self).clean()

        # Confirms that the two password fields match
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords did not match.")

        # We must return the cleaned data we got from our parent.
        return cleaned_data


    # Customizes form validation for the username field.
    def clean_username(self):
        # Confirms that the username is not already present in the
        # User model database.
        username = self.cleaned_data.get('username')
        if User.objects.filter(username__exact=username):
            raise forms.ValidationError("Username is already taken.")

        # We must return the cleaned data we got from the cleaned_data
        # dictionary
        return username



class profileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('gender', 'nationality', 'tags', 'program', )


MAX_UPLOAD_SIZE = 2500000

class PictureForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('picture',)

    def clean_picture(self):
        picture = self.cleaned_data['picture']
        if not picture:
            raise forms.ValidationError('You must upload a picture')
        if not picture.content_type or not picture.content_type.startswith('image'):
            raise forms.ValidationError('File type is not image')
        if picture.size > MAX_UPLOAD_SIZE:
            raise forms.ValidationError('File too big (max size is {0} bytes)'.format(MAX_UPLOAD_SIZE))
        return picture


# MAX_UPLOAD_SIZE = 2500000

# class profileForm(forms.ModelForm):
#     class Meta:
#         model = Profile
#         fields = ('gender', 'nationality', 'tags', 'program', 'picture',)

#     def clean_picture(self):
#         picture = self.cleaned_data['picture']
#         if not picture:
#             raise forms.ValidationError('You must upload a picture')
#         if not picture.content_type or not picture.content_type.startswith('image'):
#             raise forms.ValidationError('File type is not image')
#         if picture.size > MAX_UPLOAD_SIZE:
#             raise forms.ValidationError('File too big (max size is {0} bytes)'.format(MAX_UPLOAD_SIZE))
#         return picture


class propertyForm(forms.ModelForm):
    class Meta:
        model = Property
        fields = ('description', 'neighborhood', 'address1', 'address2', 'name', 'transport', 'coordinates', 'propertyPicture', 'content_type')


class userprofileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = '__all__'
        # fields = ('gender', 'nationality', 'tags', 'program',  'user')
