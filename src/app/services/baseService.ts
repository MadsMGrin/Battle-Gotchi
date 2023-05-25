import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import {FirebaseInitService} from "../fire.service";

@Injectable()
export abstract class BaseService {
  auth: firebase.auth.Auth;
  protected firestore: firebase.firestore.Firestore;
  protected baseurl = "http://127.0.0.1:5001/battlegotchi-63c2e/us-central1/api/";
  constructor(firebaseInitService: FirebaseInitService) {
    this.auth = firebaseInitService.auth;
    this.firestore = firebaseInitService.firestore;
    this.baseurl = "http://127.0.0.1:5001/battlegotchi-63c2e/us-central1/api/";
  }

  getCurrentUserId(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User not logged in!');
    }
    return uid;
  }
  async register(email: string, password: string, username: string): Promise<firebase.auth.UserCredential> {
    const db = firebase.firestore();

    const userSnapshot = await db.collection('users').where('username', '==', username).get();
    if (!userSnapshot.empty) {
      throw new Error('This username already exists');
    }

    const credential = await this.auth.createUserWithEmailAndPassword(email, password);
    if (!credential.user) {
      throw new Error('Failed to create user');
    }

    const userId = credential.user.uid;

    await db.collection('users').doc(userId).set({
      username,
      email,
      status: 'online',
    });

    await db.collection('usernames').doc(username).set({ uid: userId });

    return credential;
  } // has to be moved to index
}
