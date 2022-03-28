import { getApps, initializeApp } from 'firebase/app'

import {
  getFirestore,
  collection,
  getDocs
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCAoN9pJ9IjGNYtOXmc9KKNiGBlDlU9X8k',
  authDomain: 'crew-eb850.firebaseapp.com',
  projectId: 'crew-eb850',
  storageBucket: 'crew-eb850.appspot.com',
  messagingSenderId: '356215413236',
  appId: '1:356215413236:web:03fa759be6850e260581a1'
}

if (!getApps.length) {
  initializeApp(firebaseConfig)
}
export const db = getFirestore()

export const getEvents = async () => {
  const eventsCol = collection(db, 'events')
  const eventSnap = await getDocs(eventsCol)
  const eventList = eventSnap.docs.map(doc => doc.data())
  console.log(eventList)
  return eventList
}
