import requests
from django.http import JsonResponse
from django.shortcuts import render
from .forms import PlaceSearchForm
from decouple import config
import logging

def home(request):
    return render(request, 'places/home.html')

def login(request):
    return render(request, 'places/login.html')

def favorites(request):
    return render(request, 'places/favorites.html')

def search_places(request):
    results = []
    form = PlaceSearchForm()
    api_key = config('GOOGLE_API_KEY')

    if request.method == 'POST':
        form = PlaceSearchForm(request.POST)
        search_type = request.POST.get('search_type', 'location')

        if form.is_valid():
            query = form.cleaned_data['query']

            if search_type == 'name':
                query += " restaurant"
            elif search_type == 'cuisine':
                query += " food"
            elif search_type == 'location':
                query += " food restaurant"

            url = f'https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&type=restaurant&key={api_key}'
            logging.debug(f"API Request URL: {url}")  # Log the URL

            response = requests.get(url)
            data = response.json()
            logging.debug(f"API Response: {data}")  # Log the response

            results = data.get('results', [])

            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'results': results})

    return render(request, 'places/search.html', {'form': form, 'results': results, 'api_key': api_key})
