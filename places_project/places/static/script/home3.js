async function fetchTopRestaurants(searchTerm = 'best') {
    const response = await fetch(`/api/top-restaurants/?search=${searchTerm}`);
    const data = await response.json();
    const restaurantList = document.getElementById('restaurant-list');

    restaurantList.innerHTML = '';

    const getPriceRange = (level) => {
        if (level === null) return '$$';
        return '$'.repeat(level);
    };
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

document.addEventListener('DOMContentLoaded', () => fetchTopRestaurants('best'));

function createStarRating(rating) {
    const maxStars = 5;
    const filledStars = Math.round(rating);

    let starsHtml = '';
    for (let i = 1; i <= maxStars; i++) {
        starsHtml += `<span class="star ${i <= filledStars ? 'filled' : ''}">&#9733;</span>`;
    }
    return starsHtml;
}