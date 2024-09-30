from django.urls import path
from .views import home, search_places, login, favorites  # Import your views

urlpatterns = [
    path('', home, name='home'),
    path('search/', search_places, name='search_places'),
    path('login/', login, name='login'),
    path('favorites/', favorites, name='favorites'),  # Add this line
    # path('account/', account, name = 'account')
]

