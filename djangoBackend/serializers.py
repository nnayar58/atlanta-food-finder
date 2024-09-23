from rest_framework import serializers
from .models import UserProfile, Review, Restaurant, UserSavedRestaurant, UserFavoriteRestaurant

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['name', 'genre']


class ReviewSerializer(serializers.ModelSerializer):
    restaurant = RestaurantSerializer()

    class Meta:
        model = Review
        fields = ['content', 'restaurant']


class SavedRestaurantSerializer(serializers.ModelSerializer):
    restaurant = RestaurantSerializer()

    class Meta:
        model = UserSavedRestaurant
        fields = ['restaurant']


class FavoriteRestaurantSerializer(serializers.ModelSerializer):
    restaurant = RestaurantSerializer()

    class Meta:
        model = UserFavoriteRestaurant
        fields = ['restaurant']


class ProfileSerializer(serializers.ModelSerializer):
    saved_restaurants = SavedRestaurantSerializer(source='saved_restaurants', many=True)
    favorite_restaurants = FavoriteRestaurantSerializer(source='favorite_restaurants', many=True)
    reviews = ReviewSerializer(source='review_set', many=True)

    class Meta:
        model = UserProfile
        fields = ['userName', 'photo', 'saved_restaurants', 'favorite_restaurants', 'reviews']