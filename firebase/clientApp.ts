import { getApps, initializeApp } from 'firebase/app'

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc
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
  const eventList = eventSnap.docs.map(doc => { return { ...doc.data(), id: doc.id } })
  return eventList
}

export const update = async (id:string, name:string, pos:string) => {
  if (name === undefined) return false
  const eventRef = doc(db, 'events', id)
  const eventSnap = await getDoc(eventRef)
  if (eventSnap.exists()) {
    const data = eventSnap.data()
    for (let i = 0; i < data.positions.length; i++) {
      if (data.positions[i].name === pos) {
        data.positions[i].assigned = name
      }
    }
    await setDoc(eventRef, data)
    return true
  } else {
    return false
  }
}

export const checkPass = async (pass:string) => {
  if (pass === undefined) return false
  const configRef = doc(db, 'config', 'pass')
  const configSnap = await getDoc(configRef)
  if (configSnap.exists()) {
    const data = configSnap.data()
    if (data.value === pass) return true
    else return false
  } else {
    return false
  }
}
