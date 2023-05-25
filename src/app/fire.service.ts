import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import * as config from '../../firebaseconfig.js'

@Injectable({
  providedIn: 'root'
})
export class FirebaseInitService {
  auth: firebase.auth.Auth;
  firestore: firebase.firestore.Firestore;

  constructor() {
    this.auth = firebase.auth();
    this.firestore = firebase.firestore();

  }

}
