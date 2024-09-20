function initMap() {
    // Set the default location to Atlanta, GA
    const atlanta = { lat: 33.7490, lng: -84.3880 };

    // Initialize the map centered around Atlanta
    const map = new google.maps.Map(document.getElementById('map'), {
        center: atlanta,
        zoom: 12
    });

    // Create the search box and link it to the UI element
    const input = document.getElementById('pac-input');  // Make sure the search bar has the correct ID
    const searchBox = new google.maps.places.SearchBox(input);

    // Bias the SearchBox results towards the map's viewport
    map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];

    // Listen for the event when the user selects a prediction and retrieves more details
    searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        // Clear out the old markers
        markers.forEach((marker) => {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name, and location
        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }

            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };

            // Create a marker for each place
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location,
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}
