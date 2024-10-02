const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const signInForm = document.getElementById('signIn');
const signUpForm = document.getElementById('signup');
const resetPasswordContainer = document.getElementById('resetPasswordContainer');
const forgotPasswordButton = document.getElementById('forgotPasswordButton');

signUpButton.addEventListener('click', function () {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
});

signInButton.addEventListener('click', function () {
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
});

forgotPasswordButton.addEventListener('click', function () {
    signInForm.style.display = "none"; // Hide sign in form
    resetPasswordContainer.style.display = "block"; // Show reset password form
});

recoverSignUpButton.addEventListener('click', function () {
    resetPasswordContainer.style.display = "none";
    signUpForm.style.display = "block";
});

recoverSignInButton.addEventListener('click', function () {
    signInForm.style.display = "block";
    resetPasswordContainer.style.display = "none";
});

submitResetPassword.addEventListener('click', function () {
    setTimeout(function () {
        signInForm.style.display = "block";
        resetPasswordContainer.style.display = "none";
    }, 3000);
});