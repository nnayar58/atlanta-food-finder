from django.db import models;

class user(models.Model):
    userName = models.CharField(max_length = 30)
    password = models.CharField(max_length = 30)

class restaurant(models.Model): 
    name = models.CharField(max_length = 40)
    genre = models.CharField(max_length = 20)