import { Injectable } from '@angular/core';
import {FireService} from "../fire.service";
import axios from "axios";
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import firebase from "firebase/compat/app";

@Injectable({
  providedIn: 'root'
})
export class UserService  {

  constructor() {}

  async signIn(email: string, password: string) {
    await FireService.instance.auth.signInWithEmailAndPassword(email, password);
  }
  async signOut() {
    const userId =  FireService.instance.auth.currentUser?.uid;

    if (userId) {
      try {
        const db = firebase.firestore();
        await db.collection('users').doc(userId).set({
          status: 'offline',
        }, { merge: true });
      } catch (error) {
        console.error('Error updating user status:', error);
        // Handle the error accordingly
      }
    }

    await FireService.instance.auth.signOut();
  }
  async getOnlineUsers() {
    try {
      const response = await axios.get('http://127.0.0.1:5001/battlegotchi-63c2e/us-central1/api/onlineusers');
      // Filter out the current user from the response data
      const onlineUsers = response.data.filter(user => user && user.uid !== FireService.instance.auth.currentUser?.uid)
        .map(user => ({ username: user?.username, uid: user?.uid }));
      return onlineUsers;
    } catch (error) {
      console.error('Error retrieving online users:', error);
      throw new Error('Failed to retrieve online users');
    }
  }
}
