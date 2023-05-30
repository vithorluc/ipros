import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyARxSA1HqDn5NETnwHmNHFx9avRNIhl8wU',
  authDomain: 'faturas-app.firebaseapp.com',
  projectId: 'faturas-app',
  storageBucket: 'faturas-app.appspot.com',
  messagingSenderId: '497263459374',
  appId: '1:497263459374:web:e80dd4cf14b4ef7e25b3bf'
}

const app = initializeApp(firebaseConfig)
const database = getFirestore(app)

export default database
