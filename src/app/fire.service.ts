import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import * as config from '../../firebaseconfig.js'
import { gotchi } from "../entities/gotchi";
import {quest} from "../entities/quest";

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
    this.firestore.useEmulator("localhost",8080)
    this.auth.useEmulator("http://localhost:9099")
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


  async getGotchi(): Promise<gotchi>{

    var gotchiDTO = new gotchi()

    await this.firestore.collection("gotchi").where("user", "==", firebase.auth().currentUser?.uid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if(doc.exists){
            console.log(doc.data())
            gotchiDTO = {
              hunger: doc.data()['hunger'],
              sleep: doc.data()['sleep'],
              cleanliness: doc.data()['cleanliness'],
              health: doc.data()['health'],
              strength: doc.data()['strength'],
              dexterity: doc.data()['dexterity'],
              stamina: doc.data()['stamina'],
            }
            return gotchiDTO;

          }
          else {console.log("Your gotchi does not exist");
            return gotchiDTO;
          }
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
    return gotchiDTO;
  }

  async getQuest(category: string): Promise<quest[]> {
    const quests: quest[] = [];

    const querySnapshot = await this.firestore.collection("quests")
      .where("category", "==", category)
      .get();
    querySnapshot.forEach((doc) => {
      if (doc.exists) {
        const questDTO: quest = {
          name: doc.data()['name'],
          description: doc.data()['description'],
          progress: doc.data()['progress'],
          duration: doc.data()['duration'],
          completion: doc.data()['completion'],
          category: doc.data()['category'],
          reward: doc.data()['reward']
        };
        quests.push(questDTO);
      } else {
        console.log("Your quest does not exist");
      }
    });
    console.log(quests)
    return quests;
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



}
