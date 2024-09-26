// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js"
import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaksMhL-KOHAK7dU2FbWARAK-fi0eMZ2c",
  authDomain: "atlfoodfinder-36723.firebaseapp.com",
  projectId: "atlfoodfinder-36723",
  storageBucket: "atlfoodfinder-36723.appspot.com",
  messagingSenderId: "983786705848",
  appId: "1:983786705848:web:61c356afbf8767edd1b54d",
  measurementId: "G-Y1HT45EZ72"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function showMessage(message, divId){
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display="block";
    messageDiv.innerHTML=message;
    messageDiv.style.opacity=1;
    setTimeout(function(){
        messageDiv.style.opacity=0;
    },5000) 
}
const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
    event.preventDefault();
    const email=document.getElementById('rEmail').value;
    const password=document.getElementById('rPassword').value;
    const firstName=document.getElementById('fName').value;
    const lastName=document.getElementById('lName').value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential)=>{
        const user=userCredential.user;
        const userData={
            email: email,
            firstName: firstName,
            lastName: lastName
        };
        showMessage('Account created successfully', 'signUpMessage');
        const docRef=doc(db, "users", user.uid);
        setDoc(docRef,userData)
        .then(()=>{
            window.location.href='signup.html';
        })
        .catch((error)=> {
            console.error("error writing document",error)
        });
    })
    // .catch(error)=>{
    //     const errorCode=error.code;
    //     if(errorCpde=='auth/email-already-in-use'){
    //         showMessage('Email Address Already Exists !!!', 'signUpMessage');
    //     }
    //     else {
    //         showMessage('Unable to create user', 'signUpMessage');
    //     }
    // }
});