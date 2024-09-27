from django.db import models

# Create your models here.
class Review(models.Model):
    place_id = models.CharField(max_length=255)
    review_text = models.TextField()
    rating = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)