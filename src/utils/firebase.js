import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCzV1WqyzVNQ_cfzBEl8jS6b-fGyQ0sy4A",
  authDomain: "bet-you-cant-69f6b.firebaseapp.com",
  projectId: "bet-you-cant-69f6b",
  storageBucket: "bet-you-cant-69f6b.firebasestorage.app",
  messagingSenderId: "45634146563",
  appId: "1:45634146563:web:005dabce5e4f3600415936",
  measurementId: "G-WVXKM740H2"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)