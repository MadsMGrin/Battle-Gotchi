import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import * as config from '../../firebaseconfig.js'
import {gotchi} from "../entities/gotchi";

@Injectable({
  providedIn: 'root'
})
export class FireService {

  firebaseApplication;
  firestore: firebase.firestore.Firestore;
  auth: firebase.auth.Auth;

  constructor() {
    this.firebaseApplication = firebase.initializeApp(config.firebaseConfig);
    this.firestore = firebase.firestore();
    this.auth = firebase.auth();
    // Handle auth state changes
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        // mark user as online on sign in
        this.firestore.collection('users').doc(user.uid).update({status: 'online'});
      } else {
       // mark user aas offline on signout, not sure if this will bug out if user disconnects or loses connection to Wi-Fi?
        if (this.auth.currentUser) {
          this.firestore.collection('users').doc(this.auth.currentUser.uid).update({status: 'offline'});
        }
      }
    });
  }

  async createGotchi(){
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    const gotchiDTO: gotchi = {
      user: user.uid,
      hunger: 50,
      sleep: 50,
      cleanliness: 50,
      health: 50,
      strength: 0,
      dexterity: 0,
      stamina: 0,
    }
    await this.firestore.collection('gotchi').add(gotchiDTO);
  }

  async getGotchi(){
    const snapshot = await this.firestore.collection('gotchi').where('uid', '==', this.auth.currentUser?.uid).get();
    return snapshot.docs.map(doc => doc.data());
  }



  async register(email: string, password: string, username: string) {
    const db = firebase.firestore();

    // Check if the username already exists in the collection
    const userSnapshot = await db.collection('users').where('username', '==', username).get();

    if (!userSnapshot.empty) {
      throw new Error('This username already exists');
    }

    const credential = await this.auth.createUserWithEmailAndPassword(email, password);
    if (credential.user) {
      const userDocRef = db.collection('users').doc(credential.user.uid);

      // Create user document
      await userDocRef.set({
        username: username,
        email: email,
        status: 'online',
      });

      // Create a separate document with the username as the ID
      await db.collection('usernames').doc(username).set({
        uid: credential.user.uid
      });
    }
  }



  async signIn(email: string, password: string){
    await this.auth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    await this.auth.signOut();
  }

  async getOnlineUsers(){
    // get a snapshot of all online users
    const snapshot = await this.firestore.collection('users').where('status', '==', 'online').get();
    // returns them as array of users.
    return snapshot.docs.map(doc => doc.data());
  }
}
