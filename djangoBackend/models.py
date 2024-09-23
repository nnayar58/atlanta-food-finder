from django.db import models
from django.contrib.auth.models import User
from django.db import models

class user(models.Model):
    userName = models.CharField(max_length = 30)
    password = models.CharField(max_length = 30)

class restaurant(models.Model): 
    name = models.CharField(max_length = 40)
    genre = models.CharField(max_length = 20)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    userName = models.CharField(max_length=30)
    password = models.CharField(max_length=30)
    photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)

    def __str__(self):
        return self.userName


class Restaurant(models.Model):
    name = models.CharField(max_length=40)
    genre = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class UserSavedRestaurant(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="saved_restaurants")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.userName} saved {self.restaurant.name}"


class UserFavoriteRestaurant(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="favorite_restaurants")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.userName} favorited {self.restaurant.name}"


class Review(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    content = models.TextField()

    def __str__(self):
        return f"Review by {self.user.userName} on {self.restaurant.name}"