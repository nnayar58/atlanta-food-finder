const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const signInForm = document.getElementById('signIn');
const signUpForm = document.getElementById('signup');
const resetPasswordContainer = document.getElementById('resetPasswordContainer');
const forgotPasswordButton = document.getElementById('forgotPasswordButton');

// Switch to sign up form
signUpButton.addEventListener('click', function () {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
});

// Switch to sign in form
signInButton.addEventListener('click', function () {
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
});

// Show reset password container
forgotPasswordButton.addEventListener('click', function () {
    signInForm.style.display = "none"; // Hide sign in form
    resetPasswordContainer.style.display = "block"; // Show reset password form
});

