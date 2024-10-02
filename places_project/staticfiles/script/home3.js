async function fetchTopRestaurants(searchTerm = 'best') {
    const response = await fetch(`/api/top-restaurants/?search=${searchTerm}`);
    const data = await response.json(); // Assuming the API returns JSON
    const restaurantList = document.getElementById('restaurant-list');

    restaurantList.innerHTML = ''; // Clear previous items

    // Function to convert price level number to string
    const getPriceRange = (level) => {
        if (level === null) return '$$'; // Handle cases where price level is not available
        return '$'.repeat(level); // Convert level to corresponding $ string
    };
    // Loop through the top 5 restaurants and add them to the list
    data.restaurants.slice(0, 10).forEach(restaurant => {
        const restaurantItem = document.createElement('div');
        restaurantItem.className = 'restaurant-item';
        restaurantItem.innerHTML = `
            <strong class="restaurant-name">${restaurant.name}</strong><br>
            <span class="restaurant-address">${restaurant.address}</span><br>
            <span class="restaurant-label">Rating:</span> ${restaurant.rating} ${createStarRating(restaurant.rating)}<br>
            <span class="restaurant-label">Price Range:</span> ${getPriceRange(restaurant.price_level)}<br>
            <span class="see-more-button" onclick="window.location.href='/restaurant/${restaurant.place_id}/';">See More</button>
        `;
        restaurantList.appendChild(restaurantItem);
    });

}

// Call the function with 'best' as the search term on page load
document.addEventListener('DOMContentLoaded', () => fetchTopRestaurants('best'));

function createStarRating(rating) {
    const maxStars = 5; // Total number of stars
    const filledStars = Math.round(rating); // Number of filled stars based on rating

    let starsHtml = '';
    for (let i = 1; i <= maxStars; i++) {
        starsHtml += `<span class="star ${i <= filledStars ? 'filled' : ''}">&#9733;</span>`; // Use filled star for the filled rating
    }
    return starsHtml;
}