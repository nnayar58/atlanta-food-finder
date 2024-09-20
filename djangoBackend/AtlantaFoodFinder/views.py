# views.py
from django.shortcuts import render
from django.conf import settings

# View for the search results page
def search_results_view(request):
    context = {
        'GOOGLE_MAPS_API_KEY': settings.GOOGLE_MAPS_API_KEY  # Pass the key from settings
    }
    return render(request, 'search-results.html', context)

# View for the login page
def login_view(request):
    return render(request, 'login.html')

# View for the signup page
def signup_view(request):
    return render(request, 'signup.html')

# View for the account page
def account_view(request):
    return render(request, 'account.html')

# View for the home page
def home_view(request):
    return render(request, 'home.html')
