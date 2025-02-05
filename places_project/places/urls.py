from django.urls import path
from .views import home, search_places, login, favorites, account, get_top_restaurants  # Import your views
from . import views

urlpatterns = [
    path('', home, name='home'),
    path('search/', search_places, name='search_places'),
    path('login/', login, name='login'),
    path('favorites/', favorites, name='favorites'),
    path('restaurant/<str:place_id>/', views.restaurant_detail, name='restaurant_detail'),
    path('account/', account, name = 'account'),
    path('api/top-restaurants/', get_top_restaurants, name='top_restaurants'),

]

