import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import axios from 'axios'
import * as config from '../../firebaseconfig.js'
import { gotchi } from "../entities/gotchi";

@Injectable({
  providedIn: 'root'
})
export class FireService {
  firebaseApplication;
  firestore: firebase.firestore.Firestore;
  auth: firebase.auth.Auth;
  baseurl: string = "http://127.0.0.1:5001/battlegotchi-63c2e/us-central1/api/";

  constructor() {
    this.firebaseApplication = firebase.initializeApp(config.firebaseConfig);
    this.firestore = firebase.firestore();
    this.auth = firebase.auth();
    this.firestore.useEmulator("localhost",8080);
    this.auth.useEmulator("http://localhost:9099");
    // Handle auth state changes
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        // mark user as online on sign in
        this.firestore.collection('users').doc(user.uid).update({ status: 'online' });
      } else {
        // mark user as offline on sign out
        if (this.auth.currentUser) {
          this.firestore.collection('users').doc(this.auth.currentUser.uid).update({ status: 'offline' });
        }
      }
    });
  }

  async getGotchi() {
    const snapshot = await this.firestore.collection('gotchi').where('user', '==', this.auth.currentUser?.uid).get();
    return snapshot.docs.map(doc => doc.data());
  }

  async register(email: string, password: string, username: string): Promise<firebase.auth.UserCredential> {
    const db = firebase.firestore();

    // Check if the username already exists in the collection
    const userSnapshot = await db.collection('users').where('username', '==', username).get();

    if (!userSnapshot.empty) {
      throw new Error('This username already exists');
    }

    const credential = await this.auth.createUserWithEmailAndPassword(email, password);
    if (credential.user) {
      const userId = credential.user.uid;

      // Create user document with the user ID
      await db.collection('users').doc(userId).set({
        username: username,
        email: email,
        status: 'online',
      });

      // Create a new document with the username as the ID
      await db.collection('usernames').doc(username).set({
        uid: userId
      });

      return credential; // Return the credential object
    } else {
      throw new Error('Failed to create user');
    }
  }

  async signIn(email: string, password: string) {
    await this.auth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    await this.auth.signOut();
  }

  async getOnlineUsers() {
    try {
      const response = await axios.get('http://127.0.0.1:5001/battlegotchi-63c2e/us-central1/api/onlineusers');
      const onlineUsers = response.data.filter(user => user.uid !== this.auth.currentUser?.uid)
        .map(user => ({ username: user.username, uid: user.uid }));
      return onlineUsers;
    } catch (error) {
      console.error('Error retrieving online users:', error);
      throw new Error('Failed to retrieve online users');
    }
  }


  // method used for sending battle request to another user.
  async sendBattleRequest(receiverId: string): Promise<void> {
    console.log('Current user:', this.auth.currentUser, 'UID:', this.auth.currentUser?.uid, 'Receiver ID:', receiverId);

    const senderId = this.auth.currentUser?.uid;

    if (!receiverId || !senderId) {
      throw new Error('User IDs not provided');
    }
    const senderReferfance = this.firestore.collection('users').doc(senderId);
    const senderDoc = await senderReferfance.get();
    const cooldownTimestamp = senderDoc.data()?.['cooldownTimestamp'] || 0;
    const currentTimestamp = firebase.firestore.Timestamp.now().toMillis();

    if (currentTimestamp < cooldownTimestamp) {
      throw new Error('Stop Spamming people');
    }

    const battleRequest = {
      senderId: senderId,
      receiverId: receiverId,
      status: 'pending'
    };

    await this.firestore.collection('battleRequests').add(battleRequest);

    // cooldown is set to 1min for now,
    const cooldownPeriod = 60000;
    const newCooldownTimestamp = currentTimestamp + cooldownPeriod;
    await senderReferfance.update({ ['cooldownTimestamp']: newCooldownTimestamp });
  }

}
