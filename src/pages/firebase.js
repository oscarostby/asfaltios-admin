// firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // Import this function
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,  // Optional for adding user data during sign-up
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLXQnxkW7jl_ufdPXHquUWwf_7OOG7SC4",
  authDomain: "asfaltios-security.firebaseapp.com",
  projectId: "asfaltios-security",
  storageBucket: "asfaltios-security.appspot.com",
  messagingSenderId: "269040564652",
  appId: "1:269040564652:web:d72b269d7c0923e4e3a209",
  measurementId: "G-3Y8PLM19Q4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Function to check if user is approved and admin
const checkUserStatus = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const userData = docSnap.data();
    return {
      isAdmin: userData.role === 'admin',  // Assuming a role field in Firestore
      isApproved: userData.isApproved,     // Assuming an isApproved field in Firestore
    };
  }
  return { isAdmin: false, isApproved: false };
};

// Optional: Function to add user data to Firestore after sign-up
const addUserToFirestore = async (uid, userData) => {
  try {
    await setDoc(doc(db, "users", uid), userData);
  } catch (error) {
    console.error("Error adding user to Firestore: ", error);
  }
};

// Sign-up function using email and password
const registerWithEmailAndPassword = async (email, password, username) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Add user to Firestore with additional data like username
    await addUserToFirestore(result.user.uid, {
      email: email,
      username: username,
      role: 'user',         // Set default role to user
      isApproved: false,    // Default to not approved, admin needs to approve
    });
    return result;
  } catch (error) {
    console.error("Error during sign-up: ", error);
    throw error;
  }
};

export {
  auth,
  provider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  registerWithEmailAndPassword, // Export the sign-up function
  signOut,
  checkUserStatus,
};
