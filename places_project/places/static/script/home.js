async function fetchTopRestaurants(searchTerm = 'best') {
    const response = await fetch(`/api/top-restaurants/?search=${searchTerm}`);
    const data = await response.json(); // Assuming the API returns JSON
    const restaurantList = document.getElementById('restaurant-list');

    restaurantList.innerHTML = ''; // Clear previous items

    // Function to convert price level number to string
    const getPriceRange = (level) => {
        if (level === null) return 'N/A'; // Handle cases where price level is not available
        return '$'.repeat(level); // Convert level to corresponding $ string
    };

    // Loop through the top 5 restaurants and add them to the list
    data.restaurants.slice(0, 10).forEach(restaurant => {
        const restaurantItem = document.createElement('div');
        restaurantItem.className = 'restaurant-item';
        restaurantItem.innerHTML = `
            <strong class="restaurant-name">${restaurant.name}</strong><br>
            <span class="restaurant-address">${restaurant.address}</span><br>
            <span class="restaurant-label">Rating:</span>${restaurant.rating}</span><br>
            <span class="restaurant-label">Price Range:</span> ${getPriceRange(restaurant.price_level)}<br>
            <span class="see-more-button" onclick="window.location.href='/restaurant/${restaurant.place_id}/';">See More</button>
        `;
        restaurantList.appendChild(restaurantItem);
    });

}

// Call the function with 'best' as the search term on page load
document.addEventListener('DOMContentLoaded', () => fetchTopRestaurants('best'));
