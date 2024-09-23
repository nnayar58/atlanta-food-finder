import React, { useState, useEffect } from 'react';

const UserProfile = () => {
    const [profile, setProfile] = useState({
        username: '',
        photo: '',
        savedRestaurants: [],
        favoriteRestaurants: [],
        reviews: []
    });

    useEffect(() => {
        fetch('/api/profile')
            .then(response => response.json())
            .then(data => setProfile(data))
    }, []);

    const handleSwitchAccount = () => {
        window.location.href = '/switch-account';
    };

    return (
        <div className="profile-container">
          <div className="profile-header">
            <img src={profile.photo} alt="Profile" className="profile-photo" />
            <h2>{profile.username}</h2>
          </div>

          <div className="profile-section">
            <h3>Saved Restaurants</h3>
            <ul>
              {profile.savedRestaurants.map((restaurant, index) => (
                <li key={index}>{restaurant.name}</li>
              ))}
            </ul>
          </div>

          <div className="profile-section">
            <h3>Favorite Restaurants</h3>
            <ul>
              {profile.favoriteRestaurants.map((restaurant, index) => (
                <li key={index}>{restaurant.name}</li>
              ))}
            </ul>
          </div>

          <div className="profile-section">
            <h3>Your Reviews</h3>
            <ul>
              {profile.reviews.map((review, index) => (
                <li key={index}>{review.content}</li>
              ))}
            </ul>
          </div>

          <div className="profile-actions">
            <button onClick={handleLogout}>Log Out</button>
            <button onClick={handleSwitchAccount}>Switch Account</button>
          </div>
        </div>
    );
};

export default UserProfile;