import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import axios from 'axios'
import * as config from '../../firebaseconfig.js'
import { gotchi } from "../entities/gotchi";
import {quest} from "../entities/quest";
import {userQuest} from "../entities/userQuest";
import {item} from "../entities/item";

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
    const questTypes = ['daily', 'weekly', 'monthly'];

    const quests = await Promise.all(questTypes.map(async (type) => {
      const quest = await this.getRandomQuest(type);
      if (!quest) {
        throw new Error('Failed to get quests');
      }
      const rewardPromise = this.randomItem(); // Get the promise from randomItem()
      const reward = await rewardPromise; // Await the resolution of the promise
      return {
        name: quest.name,
        description: quest.description,
        progress: quest.progress,
        action: quest.action,
        duration: quest.duration,
        completion: quest.completion,
        category: quest.category,
        reward: reward,
      };
    }));


    const [dailyQuest, weeklyQuest, monthlyQuest] = quests;

    await db.collection('users').doc(userId).set({
      username,
      email,
      status: 'online',
      dailyQuest,
      weeklyQuest,
      monthlyQuest
    });

    await db.collection('usernames').doc(username).set({ uid: userId });

    return credential;
  } // has to be moved to index

}
