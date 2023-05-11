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
    this.firebaseApplication = firebase.initializeApp(config.firebaseconfig);
    this.firestore = firebase.firestore();
    this.auth = firebase.auth();
    this.firestore.useEmulator("localhost", 8080);
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
    await firebase.firestore().collection('gotchi').where('uid', '==', firebase.auth().currentUser?.uid).get();
  }

  async register(email: string, password: string){
    await this.auth.createUserWithEmailAndPassword(email, password);
  }

  async signIn(email: string, password: string){
    await this.auth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    await this.auth.signOut();
  }
}
