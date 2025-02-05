let map;
let markers = []; // Array to hold markers
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Load favorites from local storage
let currentPlaces = []; // To store the fetched places

function initMap() {
    // Create a new map centered in Atlanta
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 33.7488, lng: -84.3871 }, // Center on Atlanta
        zoom: 12, // Zoom level
    });

}

function addMarkers(places) {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = []; // Reset markers array

    if (places.length === 0) return; // Return early if no places are found

    // Center the map on the first result
    const firstPlace = places[0];
    const position = {
        lat: firstPlace.geometry.location.lat,
        lng: firstPlace.geometry.location.lng
    };

    map.setCenter(position); // Center the map on the first place
    map.setZoom(14); // Optional: Adjust zoom level

    places.forEach(place => {
        const position = {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
        };

        const marker = new google.maps.Marker({
            position: position,
            map: map,
            title: place.name,
        });

        // Create an info window to display place details
        const infoWindow = new google.maps.InfoWindow({
            content: `<h5>${place.name}</h5><p>${place.formatted_address}</p>`,
        });

        // Show info window on marker click
        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });

        // Store the marker in the array for later use
        markers.push(marker);
    });

    // Trigger map resize after adding markers
    google.maps.event.trigger(map, 'resize');
}

function updateResultsList(places) {
    const resultsContainer = document.getElementById('results-container');
    const resultsList = document.createElement('ul');
    resultsList.classList.add('list-group');

    // Clear any previous results
    resultsContainer.innerHTML = '';

    places.forEach(place => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.innerHTML = `
            <h5>${place.name}</h5>
            <p>${place.formatted_address}</p>
            <p>Rating: ${place.rating} ${createStarRating(place.rating)}</p>
            <p>Location: <strong>${place.geometry.location.lat}, ${place.geometry.location.lng}</strong></p>
            <button class="favorite-button" data-place-id="${place.place_id}">Save to Favorites</button>
        `;

        // Add event listener to the favorite button
        listItem.querySelector('.favorite-button').addEventListener('click', function () {
            const placeId = this.getAttribute('data-place-id');
            const selectedPlace = places.find(p => p.place_id === placeId);
            saveFavorite(selectedPlace);
        });

        resultsList.appendChild(listItem);
    });

    resultsContainer.appendChild(resultsList);
}


function sortPlaces(places, sortBy) {
    return places.sort((a, b) => {
        if (sortBy === 'rating') {
            return (b.rating || 0) - (a.rating || 0); // Sort by rating, descending
        } else if (sortBy === 'distance') {
            const distanceA = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(33.7488, -84.3871), // Center of Atlanta
                a.geometry.location
            );
            const distanceB = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(33.7488, -84.3871), // Center of Atlanta
                b.geometry.location
            );
            return distanceA - distanceB; // Sort by distance, ascending
        }
    });
}

document.getElementById('sort-select').addEventListener('change', () => {
    const sortBy = document.getElementById('sort-select').value;
    if (sortBy) { // Check if a valid option is selected
        const sortedPlaces = sortPlaces(currentPlaces, sortBy);
        updateResultsList(sortedPlaces);
        addMarkers(sortedPlaces);
    }
});

function createStarRating(rating) {
    const maxStars = 5; // Total number of stars
    const filledStars = Math.round(rating); // Number of filled stars based on rating

    let starsHtml = '';
    for (let i = 1; i <= maxStars; i++) {
        starsHtml += `<span class="star ${i <= filledStars ? 'filled' : ''}">&#9733;</span>`; // Use filled star for the filled rating
    }
    return starsHtml;
}

// Function to save a favorite restaurant
function saveFavorite(place) {
    if (!favorites.find(fav => fav.place_id === place.place_id)) { // Check if already favorited
        favorites.push(place); // Add to favorites
        localStorage.setItem('favorites', JSON.stringify(favorites)); // Save to local storage
        alert(`${place.name} has been added to your favorites!`);
    } else {
        alert(`${place.name} is already in your favorites!`);
    }
}

// Function to set up event listeners for both search forms
function setupSearchForm(formId) {
    const form = document.querySelector(formId);
    const searchTypeInput = form.querySelector('input[name="search_type"]');
    const queryInput = form.querySelector('input[name="query"]');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(form);
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest', // Indicate that the request is AJAX
                'X-CSRFToken': getCookie('csrftoken') // Include CSRF token
            }
        })
        .then(response => response.json())
        .then(data => {
            currentPlaces = data.results; // Store the fetched places
            addMarkers(currentPlaces); // Call function to add markers to the map
            updateResultsList(currentPlaces); // Call function to update the results list

            // Reset the sort option to default after search
            document.getElementById('sort-select').selectedIndex = 0; // Select the first option (default)
        })
        .catch(error => console.error('Error fetching places:', error));
    });
}


// Event listener to setup search forms when the document is loaded
document.addEventListener('DOMContentLoaded', function () {
    setupSearchForm('#places-search-form'); // For search.html
    setupSearchForm('#home-search-form'); // For home.html

    // Update search type and placeholder based on button click for home.html
    document.getElementById('name-button').addEventListener('click', () => {
        document.getElementById('home-search-type').value = 'name';
        document.getElementById('home-query').placeholder = 'Search by Restaurant Name';
    });

    document.getElementById('cuisine-button').addEventListener('click', () => {
        document.getElementById('home-search-type').value = 'cuisine';
        document.getElementById('home-query').placeholder = 'Search by Cuisine';
    });

    document.getElementById('location-button').addEventListener('click', () => {
        document.getElementById('home-search-type').value = 'location';
        document.getElementById('home-query').placeholder = 'Search by Location';
    });

    // Update search type and placeholder based on button click for search.html
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

// Function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Check if this cookie string begins with the desired name
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
                if (currentActive) currentActive.classList.remove('active'); // Remove active class from the current active button
                button.classList.add('active'); // Add active class to the clicked button

                // Fetch places based on the active search type and update results
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
                    currentPlaces = data.results; // Update the global variable with current places
                    const sortedPlaces = sortPlaces(currentPlaces, document.getElementById('sort-select').value);
                    updateResultsList(sortedPlaces);
                    addMarkers(sortedPlaces);
                });
            });
        });
    }
    applyButtonLogic(homeButtons, 'home'); // Apply to home buttons
    applyButtonLogic(document.querySelectorAll('#search-buttons button'), 'search'); // Apply to search buttons
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
