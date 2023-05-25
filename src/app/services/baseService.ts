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
}
