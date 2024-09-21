// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(import.meta.env.VITE_firebaseConfig);

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