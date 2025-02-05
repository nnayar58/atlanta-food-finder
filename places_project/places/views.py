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

def account(request):
    return render(request, 'places/account.html')

def get_top_restaurants(request):
    search_term = request.GET.get('search', 'best')  # Default search term is 'best'
    api_key = config('GOOGLE_API_KEY')
    location = '33.7490,-84.3880'  # Example coordinates for Atlanta
    radius = 5000  # Search radius in meters
    url = f'https://maps.googleapis.com/maps/api/place/textsearch/json?query={search_term}+restaurants&location={location}&radius={radius}&key={api_key}'

    response = requests.get(url)
    data = response.json()

    restaurants = []
    for place in data.get('results', [])[:10]:
        restaurants.append({
            'name': place['name'],
            'address': place.get('formatted_address', 'No address found'),
            'rating': place.get('rating', 'N/A'),
            'price_level': place.get('price_level', None),
            'place_id': place['place_id'],  # Add place_id here
        })


    return JsonResponse({'restaurants': restaurants})

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
            #print("API Results:", results)  # Add this line

            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'results': results})

    return render(request, 'places/search.html', {'form': form, 'results': results, 'api_key': api_key})

def restaurant_detail(request, place_id):
    # Fetch detailed information about the restaurant from Google Places API
    api_key = config('GOOGLE_API_KEY')
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&key={api_key}"

    response = requests.get(url)
    restaurant_data = response.json().get('result', {})

    # Render template with the restaurant's details
    return render(request, 'places/restaurant_detail.html', {
        'restaurant': restaurant_data,
        'api_key': api_key
    })