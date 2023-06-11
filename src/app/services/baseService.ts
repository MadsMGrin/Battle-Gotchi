import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import {FirebaseInitService} from "../fire.service";

@Injectable()
// it's a class that can be extened by other classes.
export abstract class BaseService {
  auth: firebase.auth.Auth;
  protected firestore: firebase.firestore.Firestore; // its protected, so its can't be accessed by other classes, so only the service layer can gain access to it
  protected baseurl = "http://127.0.0.1:5001/battlegotchi-63c2e/us-central1/api/";
  constructor(firebaseInitService: FirebaseInitService) {
    // service as a template for the other services classes
    this.auth = firebaseInitService.auth;
    this.firestore = firebaseInitService.firestore;
    this.baseurl = "http://127.0.0.1:5001/battlegotchi-63c2e/us-central1/api/";
  }
  // something with nullable values, happened when we tried ot do it the normal way
  getCurrentUserId(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User not logged in!');
    }
    return uid;
  }
}
