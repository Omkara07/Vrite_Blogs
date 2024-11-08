// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_firebase_apikey,
    authDomain: "blog-app-dd1ff.firebaseapp.com",
    projectId: "blog-app-dd1ff",
    storageBucket: "blog-app-dd1ff.appspot.com",
    messagingSenderId: "193639479919",
    appId: "1:193639479919:web:8a8dd91f62844bcb552b9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// google auth

const auth = getAuth(app)
const provider = new GoogleAuthProvider();


export const authWithGoogle = async () => {
    try {
        // Try popup first
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (err: any) {
        console.log("Error during Google Signin with popup:", err);

        // If popup fails, fall back to redirect
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
            console.log("Popup blocked or cancelled, trying redirect...");
            try {
                await signInWithRedirect(auth, provider);
                // Note: The result will be available on the next page load
                return null;
            } catch (redirectErr) {
                console.log("Error during Google Signin with redirect:", redirectErr);
                return null;
            }
        }

        return null;
    }
};