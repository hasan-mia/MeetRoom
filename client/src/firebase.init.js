// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCc-EWpubWzUETytr-egJyaIzTqiKeJF3k",
	authDomain: "meetsrooms.firebaseapp.com",
	projectId: "meetsrooms",
	storageBucket: "meetsrooms.appspot.com",
	messagingSenderId: "213637425652",
	appId: "1:213637425652:web:8669b127deb947c014b1a1",
	measurementId: "G-7WG9HLP9V1",
	// apiKey:process.env.REACT_APP_apiKey,
	// authDomain:process.env.REACT_APP_authDomain,
	// projectId:process.env.REACT_APP_projectId,
	// storageBucket:process.env.REACT_APP_storageBucket,
	// messagingSenderId:process.env.REACT_APP_messagingSenderId,
	// appId:process.env.REACT_APP_appId,
	// measurementId:process.env.REACT_APP_measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export default auth;
