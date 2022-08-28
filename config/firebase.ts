// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import Constants from 'expo-constants';
import 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyCbCDsHLbxY89tHqqdDfite3R7e_YwZj0o',
  authDomain: 'sg-booths.firebaseapp.com',
  projectId: 'sg-booths',
  storageBucket: 'gs://sg-booths.appspot.com',
  messagingSenderId: '1041738832688',
  appId: '1:1041738832688:web:ebf2d0195264b3026586f5',
  databaseURL: 'https://sg-booths-default-rtdb.asia-southeast1.firebasedatabase.app',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const storage = getStorage(app);

export { app, db, storage };
