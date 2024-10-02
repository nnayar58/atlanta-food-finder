let map;
let markers = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentPlaces = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 33.7488, lng: -84.3871 },
        zoom: 12,
        minZoom: 10,
        maxZoom: 20,
        restriction: {
            latLngBounds: {
                north: 33.886885,
                south: 33.647912,
                west: -84.551137,
                east: -84.289779,
            },
        }
    });

    const bounds = new google.maps.LatLngBounds(
        { lat: 33.647912, lng: -84.551137 },
        { lat: 33.886885, lng: -84.289779 }
    );

    map.fitBounds(bounds);

    map.addListener('dragend', function() {
        if (!bounds.contains(map.getCenter())) {
            map.setCenter({ lat: 33.7488, lng: -84.3871 });
        }
    });
}

function validateSearchLocation(query) {
    const geocoder = new google.maps.Geocoder();
    const bounds = new google.maps.LatLngBounds(
        { lat: 33.647912, lng: -84.551137 },
        { lat: 33.886885, lng: -84.289779 }
    );

    return new Promise((resolve, reject) => {
        geocoder.geocode({ address: query }, function(results, status) {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                if (bounds.contains(location)) {
                    resolve(true);
                } else {
                    alert('Location is outside Atlanta. Please enter a location within Atlanta.');
                    resolve(false);
                }
            } else {
                alert('Geocoding failed. Please enter a valid location.');
                reject('Geocoding failed');
            }
        });
    });
}

function searchPlaces(query, searchType) {
    fetch(`/search-api?query=${query}&search_type=${searchType}`)
        .then(response => response.json())
        .then(data => {
            currentPlaces = data.results;
            if (currentPlaces.length === 0) {
                document.querySelector('.no-results').style.display = 'block';
            } else {
                document.querySelector('.no-results').style.display = 'none';
                addMarkers(currentPlaces);
                updateResultsList(currentPlaces);
            }
        })
        .catch(error => console.error('Error fetching search results:', error));
}

function addMarkers(places) {
    const atlantaBounds = new google.maps.LatLngBounds(
        { lat: 33.647912, lng: -84.551137 },
        { lat: 33.886885, lng: -84.289779 }
    );

    markers.forEach(marker => marker.setMap(null));
    markers = [];

    if (places.length === 0) return;

    const atlantaPlaces = places.filter(place => {
        const location = new google.maps.LatLng(place.geometry.location.lat, place.geometry.location.lng);
        return atlantaBounds.contains(location);
    });

    if (atlantaPlaces.length === 0) {
        alert('No places found within Atlanta.');
        return;
    }

    const firstPlace = atlantaPlaces[0];
    const position = {
        lat: firstPlace.geometry.location.lat,
        lng: firstPlace.geometry.location.lng
    };

    map.setCenter(position);
    map.setZoom(14);

    atlantaPlaces.forEach(place => {
        const position = {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
        };

        const marker = new google.maps.Marker({
            position: position,
            map: map,
            title: place.name,
        });

        const priceRange = place.price_level ? `$${'$'.repeat(place.price_level)}` : '$$';
        const infoWindowContent = `
            <div style="background-color: rgba(85, 153, 89, 0.1); padding:10px 10px; padding-top: 5px; border-radius:5px;">
                <h5><span style="font-size: 20px;">${place.name}</span></h5>
                <p>${place.formatted_address}</p>
                <p><span style="font-weight: 600;">Rating: </span>${place.rating} ${createStarRating(place.rating)}</p>
                <p><span style="font-weight: 600;">Price Range: </span> ${priceRange}</p>
                <a href="/restaurant/${place.place_id}" style="margin: 0px;" class="see-more-button">See More</a>
            </div>
        `;


        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent,
        });

        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    });

    google.maps.event.trigger(map, 'resize');
}


function updateResultsList(places) {
    const resultsContainer = document.getElementById('results-container');
    const resultsList = document.createElement('ul');
    resultsList.classList.add('list-group');

    resultsContainer.innerHTML = '';

    if (places.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No results found.</p>';
        return;
    }

    const atlantaBounds = new google.maps.LatLngBounds(
        { lat: 33.647912, lng: -84.551137 },
        { lat: 33.886885, lng: -84.289779 }
    );
    const atlantaPlaces = places.filter(place => {
        const location = new google.maps.LatLng(place.geometry.location.lat, place.geometry.location.lng);
        return atlantaBounds.contains(location);
    });

    if (atlantaPlaces.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No places found within Atlanta.</p>';
        return;
    }

    atlantaPlaces.forEach(place => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        const cuisineTypes = extractCuisineTypes(place);
        const priceRange = place.price_level ? `$${'$'.repeat(place.price_level)}` : '$$';
        const listItemContent = `
            <h5>${place.name}</h5>
            <p>${place.formatted_address}</p>
            <p><span style="font-weight: 600;">Rating: </span>${place.rating} ${createStarRating(place.rating)}</p>
            <p><span style="font-weight: 600;">Price Range: </span> ${priceRange}</p>
            <p><span style="font-weight: 600;">Cuisine: </span>${cuisineTypes || 'General/Fusion'}</p>
            <button class="favorite-button" data-place-id="${place.place_id}">Save to Favorites</button>
            <a href="/restaurant/${place.place_id}" class="see-more-button">See More</a>
        `;
        listItem.innerHTML = listItemContent;

        resultsList.appendChild(listItem);
    });

    resultsContainer.appendChild(resultsList);
}

document.addEventListener('DOMContentLoaded', function () {
    const resultsContainer = document.getElementById('results-container');

    resultsContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('favorite-button')) {
            const placeId = event.target.getAttribute('data-place-id');
            const selectedPlace = currentPlaces.find(p => p.place_id === placeId);
            saveFavorite(selectedPlace);
        }
    });
});

function sortPlaces(places, sortBy) {
    return places.sort((a, b) => {
        if (sortBy === 'rating') {
            return (b.rating || 0) - (a.rating || 0);
        } else if (sortBy === 'distance') {
            console.log(google.maps);
            const distanceA = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(33.7488, -84.3871), // Center of Atlanta
                a.geometry.location
            );
            const distanceB = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(33.7488, -84.3871), // Center of Atlanta
                b.geometry.location
            );
            return distanceA - distanceB;
        }
    });
}

document.getElementById('sort-select').addEventListener('change', () => {
    const sortBy = document.getElementById('sort-select').value;
    if (sortBy) {
        const sortedPlaces = sortPlaces(currentPlaces, sortBy);
        console.log(sortedPlaces);
        updateResultsList(sortedPlaces);
        addMarkers(sortedPlaces);
    }
});

function createStarRating(rating) {
    const maxStars = 5;
    const filledStars = Math.round(rating);

    let starsHtml = '';
    for (let i = 1; i <= maxStars; i++) {
        starsHtml += `<span class="star ${i <= filledStars ? 'filled' : ''}">&#9733;</span>`;
    }
    return starsHtml;
}

function saveFavorite(place) {
    if (!favorites.find(fav => fav.place_id === place.place_id)) {
        favorites.push(place);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${place.name} has been added to your favorites!`);
    } else {
        alert(`${place.name} is already in your favorites!`);
    }
}

function setupSearchForm(formId) {
    const form = document.querySelector(formId);
    if (!form) {
        console.error(`Form with id ${formId} not found`);
        return;
    }
    const searchTypeInput = form.querySelector('input[name="search_type"]');
    const queryInput = form.querySelector('input[name="query"]');


    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            currentPlaces = data.results;
            addMarkers(currentPlaces);
            updateResultsList(sortPlaces(currentPlaces, 'distance'));
        })
        .catch(error => console.error('Error fetching places:', error));
    });
}

document.addEventListener('DOMContentLoaded', function () {
    setupSearchForm('#places-search-form');
    const params = getQueryParams();

    const query = params.query;
    const searchType = params.searchType;

    if (query) {
        console.log("Executing search for:", query, searchType);
        searchPlaces(query, searchType);
    }

    document.getElementById('search-name').addEventListener('click', () => {
        document.getElementById('search-type').value = 'name';
        document.getElementById('query').placeholder = 'Search by Restaurant Name';
    });

    document.getElementById('search-cuisine').addEventListener('click', () => {
        document.getElementById('search-type').value = 'cuisine';
        document.getElementById('query').placeholder = 'Search by Cuisine';
    });

    document.getElementById('search-location').addEventListener('click', () => {
        document.getElementById('search-type').value = 'location';
        document.getElementById('query').placeholder = 'Search by Location';
    });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener('DOMContentLoaded', () => {
    const homeButtons = document.querySelectorAll('.search-buttons button');

    function applyButtonLogic(buttons, containerId) {
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const currentActive = document.querySelector(`#${containerId} .active`);
                if (currentActive) currentActive.classList.remove('active');
                button.classList.add('active');

                const searchType = document.getElementById(`${containerId}-search-type`).value;
                const query = document.getElementById(`${containerId}-query`).value;

                fetch(`/${containerId}-search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ type: searchType, query: query })
                })
                .then(response => response.json())
                .then(data => {
                    currentPlaces = data.results;
                    const sortedPlaces = sortPlaces(currentPlaces, document.getElementById('sort-select').value);
                    updateResultsList(sortedPlaces);
                    addMarkers(sortedPlaces);
                });
            });
        });
    }
    applyButtonLogic(homeButtons, 'home');
    applyButtonLogic(document.querySelectorAll('#search-buttons button'), 'search');
});

document.addEventListener('DOMContentLoaded', () => {
    const homeButtons = document.querySelectorAll('.search-buttons button');
    const accountButtons = document.querySelectorAll('.account-buttons button');

    function applyButtonColor(buttons, activeColor, inactiveColor) {
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => {
                    if (btn === button) {
                        btn.style.backgroundColor = activeColor;
                    } else {
                        btn.style.backgroundColor = inactiveColor;
                    }
                });

                buttons.forEach(btn => {
                    btn.style.transition = 'background-color 0.3s ease';
                });
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const homeButtons = document.querySelectorAll('.search-buttons button');

    function applyButtonColor(buttons, activeColor, inactiveColor) {
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => {
                    if (btn === button) {
                        btn.style.backgroundColor = activeColor;
                    } else {
                        btn.style.backgroundColor = inactiveColor;
                    }
                });

                buttons.forEach(btn => {
                    btn.style.transition = 'background-color 0.3s ease';
                });
            });
        });
    }
    applyButtonColor(homeButtons, '#fff', 'rgba(85, 153, 89, 0.6)');
});

function extractCuisineTypes(place) {
    const cuisineMapping = {
        indian: ['Indian', ['india','curry', 'naan', 'biryani', 'paneer', 'dal', 'samosa', 'masala', 'chutney', 'vindaloo', 'tandoori', 'pulao', 'bhog', 'dhabha']],
        chinese: ['Chinese', ['china','dumplings', 'noodles', 'wonton', 'fried rice', 'kung pao', 'spring rolls', 'tofu', 'sweet and sour', 'chow mein', 'egg roll', 'guan', 'chao']],
        italian: ['Italian', ['italy','pasta', 'pizza', 'risotto', 'lasagna', 'gelato', 'focaccia', 'pesto', 'cannoli', 'bruschetta', 'carpaccio', 'trattoria', 'osteria']],
        mexican: ['Mexican', ['mexico', 'taco', 'burrito', 'quesadilla', 'enchilada', 'guacamole', 'salsa', 'tortilla', 'casa', 'cantina', 'latina', 'tamale', 'chile relleno', 'restaurante', 'comida']],
        japanese: ['Japanese', ['japan', 'sushi', 'ramen', 'tempura', 'miso', 'teriyaki', 'udon', 'yakitori', 'sashimi', 'bento', 'onigiri', 'shokudo', 'izakaya']],
        american: ['American', ['america', 'burger', 'fries', 'shake', 'hot dog', 'bbq', 'wings', 'tender', 'meatloaf', 'apple pie', 'steak', 'diner', 'eatery']],
        korean: ['Korean', ['korea','kimchi', 'bulgogi', 'bibimbap', 'tteokbokki', 'galbi', 'japchae', 'kimbap', 'soju', 'doenjang', 'sikdang']],
        mediterranean: ['Mediterranean', ['hummus', 'falafel', 'tabbouleh', 'tzatziki', 'pita', 'gyros', 'moussaka', 'olive', 'feta', 'taverna']],
        thai: ['Thai', ['thailand','pad thai', 'green curry', 'tom yum', 'spring roll', 'satay', 'massaman', 'som tam', 'drunken noodles', 'larb', 'restaurang']],
        african: ['African', ['jollof', 'injera', 'tagine', 'bunny chow', 'biltong', 'samosa', 'piri piri', 'cassava', 'yassa']],
        vietnamese: ['Vietnamese', ['vietnam','pho', 'banh mi', 'spring roll', 'bun bo', 'rice noodle', 'nuoc cham', 'curry', 'goi', 'cha gio', 'quan', 'hàng', 'anh', 'saigon', 'nam']],
        french: ['French', ['france', 'paris', 'croissant', 'baguette', 'escargot', 'ratatouille', 'quiche', 'crepe', 'macaron', 'bouillabaisse', 'coq au vin']],
        turkish: ['Turkish', ['kebap', 'doner', 'baklava', 'meze', 'lahmacun', 'pide', 'borek', 'kofte', 'simit', 'manti']],
        asian: ['Asian', ['asian', 'asia']]
    };

    const types = place.types || [];
    const cuisines = types
        .filter(type => cuisineMapping[type.toLowerCase()])
        .map(type => cuisineMapping[type.toLowerCase()][0]);

    const nameLowerCase = place.name.toLowerCase();
    for (const [key, [value, keywords]] of Object.entries(cuisineMapping)) {
        if (nameLowerCase.includes(key) || keywords.some(keyword => nameLowerCase.includes(keyword))) {
            if (!cuisines.includes(value)) {
                cuisines.push(value);
            }
        }
    }
    return cuisines.length > 0 ? cuisines.join(', ') : null;
}