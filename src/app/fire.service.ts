import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root'
})
// instantiation of the auth and firestore. its being initialized at program start so it is resuable everywhere else, so very close to being a singleton
export class FirebaseInitService {
  auth: firebase.auth.Auth;
  firestore: firebase.firestore.Firestore;

  constructor() {
    this.auth = firebase.auth();
    this.firestore = firebase.firestore();

  }

}
