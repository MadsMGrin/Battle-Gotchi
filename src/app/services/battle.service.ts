import { Injectable } from '@angular/core';
import {FireService} from "../fire.service";
import axios from "axios";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class BattleService{

  constructor() {

  }

  async sendBattleRequest(receiverId: string): Promise<void> {

    const senderId = FireService.instance.auth.currentUser?.uid;
    if (!receiverId || !senderId) {
      throw new Error('User IDs not provided');
    }
    // Get the document reference for the sender
    const senderReference = FireService.instance.firestore.collection('users').doc(senderId);
    // Retrieve the sender's document from Firestore
    const senderDoc = await senderReference.get();
    // Get the cooldown timestamp value from the sender's document
    const cooldownTimestamp = senderDoc.data()?.['cooldownTimestamp'] || 0;
    const senderUsername = senderDoc.data()?.['username'];
    // Get the current timestamp
    const currentTimestamp = firebase.firestore.Timestamp.now().toMillis();

    if (currentTimestamp < cooldownTimestamp) {
      throw new Error('Stop Spamming people');
    }

    const battleRequest = {
      senderId: senderId,
      senderUsername: senderUsername,
      receiverId: receiverId,
    };
    await FireService.instance.firestore.collection('battleRequests').doc(senderId).set(battleRequest);
    // cooldown is set to 1min for now,
    const cooldownPeriod = 600;
    const newCooldownTimestamp = currentTimestamp + cooldownPeriod;
    await senderReference.update({ ['cooldownTimestamp']: newCooldownTimestamp });
  }
  async getMyBattleRequests(): Promise<any[]> {
    try {
      const requestList: any[] = [];

      await FireService.instance.firestore
        .collection("battleRequests")
        .where("receiverId", "==", FireService.instance.auth.currentUser?.uid)
        .onSnapshot(async (querySnapshot) => {
          requestList.length = 0;
          for (const doc of querySnapshot.docs) {
            const request = doc.data();
            const senderId = request['senderId'];
            const senderDoc = await FireService.instance.firestore.collection("users").doc(senderId).get();
            const senderName = senderDoc.data()?.['username'];
            requestList.push({ ...request, senderName });
          }
        });

      return requestList;
    } catch (error) {
      throw error;
    }
  }
  async getDocId(senderId: string){
    try {
      const refdoc = FireService.instance.firestore.collection("battleRequests").doc(senderId);
      const query = await refdoc.get();
      await refdoc.delete();
      return query

    }
    catch (error){
      throw error;
    }
  }
  async rejectBattleRequest(request: any): Promise<void> {
    try {
      const requestDocRef = FireService.instance.firestore.collection('battleRequests').doc(request.senderId);

      // Delete the battle request document
      await requestDocRef.delete();

      // Remove the onSnapshot listener for the specific document
      const unsubscribe = FireService.instance.firestore.collection('battleRequests')
        .where('senderId', '==', request.senderId)
        .onSnapshot((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });

      unsubscribe();


    } catch (error) {
      throw error;
    }
  }
  async simulateBattle(challengerId: string, opponentId: string) {
    const response = await axios.post(

      FireService.instance.baseurl + "simulateBattle", { challengerId: challengerId, opponentId: opponentId }
    );
    if(response.status === 500){
      throw new Error("There was an error simulating the battle");
    }

    return response.data;
  }
}
