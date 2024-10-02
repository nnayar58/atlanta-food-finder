import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCaksMhL-KOHAK7dU2FbWARAK-fi0eMZ2c",
    authDomain: "atlfoodfinder-36723.firebaseapp.com",
    projectId: "atlfoodfinder-36723",
    storageBucket: "atlfoodfinder-36723.appspot.com",
    messagingSenderId: "983786705848",
    appId: "1:983786705848:web:61c356afbf8767edd1b54d",
    measurementId: "G-Y1HT45EZ72"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
let isAuthenticated = false;

function updatedAuthState(user) {
    if (user) {
        isAuthenticated = true;
        localStorage.setItem('isAuthenticated', 'true');
    } else {
        isAuthenticated = false;
        localStorage.removeItem('isAuthenticated');
    }
}

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

document.addEventListener('DOMContentLoaded', (event) => {
    const signUp = document.getElementById('submitSignUp');
    signUp.addEventListener('click', (event) => {
        event.preventDefault();
        const email = document.getElementById('rEmail').value;
        const password = document.getElementById('rPassword').value;
        const firstName = document.getElementById('fName').value;
        const lastName = document.getElementById('lName').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userData = {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    favorite: []
                };
                showMessage('Account Created Successfully', 'signUpMessage');
                const docRef = doc(db, "users", user.uid);
                setDoc(docRef, userData)
                    .then(() => {
                        window.location.href = loginUrl;
                    })
                    .catch((error) => {
                        console.error("Error writing document:", error);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/email-already-in-use') {
                    showMessage('Email Address Already Exists !!!', 'signUpMessage');
                } else {
                    showMessage('Unable to create User', 'signUpMessage');
                }
            });
    });

    const signIn = document.getElementById('submitSignIn');
    signIn.addEventListener('click', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                showMessage('Login is successful', 'signInMessage');
                const user = userCredential.user;
                localStorage.setItem('loggedInUserId', user.uid);

                const docRef = doc(db, "users", user.uid);
                getDoc(docRef)
                    .then((doc) => {
                        if (doc.exists()) {
                            const userData = doc.data();
                            console.log("User data:", userData);
                            localStorage.setItem('userData', JSON.stringify(userData));
                            updatedAuthState(user);
                            window.location.href = accountUrl;
                        } else {
                            console.log("No such document!");
                        }
                    })
                    .catch((error) => {
                        console.error("Error getting document:", error);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/invalid-credential') {
                    showMessage('Incorrect Email or Password', 'signInMessage');
                } else {
                    showMessage('Account does not Exist', 'signInMessage');
                }
            });
    });

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            signOut(auth).then(() => {
                updatedAuthState(null);
                localStorage.clear();
                window.location.href = loginUrl;
            }).catch((error) => {
                console.log("Error logging out", error);
            });
        });
    }

    const resetPasswordButton = document.getElementById('submitResetPassword');
    resetPasswordButton.addEventListener('click', (event) => {
        event.preventDefault();
        const email = document.getElementById('resetEmail').value;

        sendPasswordResetEmail(auth, email)
            .then(() => {
                showMessage('Password reset email sent! Please check your inbox.', 'resetPasswordMessage');
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/user-not-found') {
                    showMessage('No user found with this email address.', 'resetPasswordMessage');
                } else {
                    showMessage('Error sending password reset email. Please try again later.', 'resetPasswordMessage');
                }
            });
    });
});
