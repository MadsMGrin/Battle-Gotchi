import { Injectable } from '@angular/core';
import {FirebaseInitService} from "../fire.service";
import axios from "axios";
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import {BaseService} from "./baseService";
@Injectable({
  providedIn: 'root'
})
export class TradeService extends BaseService{

  constructor(firebaseInitService: FirebaseInitService) {
    super(firebaseInitService);
  }

  async getMytradeMessages(): Promise<any[]>{
    try {
      const tradeRequestList: any [] = [];
      await this.firestore?.collection("tradeMessage")
        .where("recieversID", "==", this.auth.currentUser?.uid)
        .onSnapshot(async (querysnapshopt)=>{
          tradeRequestList.length =0;
          for (const doc of querysnapshopt.docs){
            const request = doc.data();
            const tradeId = doc.id;
            tradeRequestList.push({...request, docId: tradeId})
          }
        })
      return tradeRequestList;
    }
    catch (error) {
      throw (error);
      console.error()
    }
  }
  async sendTradeMessage(senderId, sellItemId, buyItemId,recieversID) {
    try {
      const response = await axios.post(this.baseurl + "tradeMessage", {
        senderiD: senderId,
        sellItemId: sellItemId,
        buyItemId: buyItemId,
        recieversID: recieversID
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to send trade message');
    }
  }
  async rejectTradeRequest(documentId) {
    try {
      const response = await axios.post(this.baseurl + "rejectTrade", {docId: documentId});
      console.log(response)
      return response;

    } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to equip item');
    }
  }
  async acceptTrade(tradeId: string): Promise<void> {
    try {
      const response = await axios.post(this.baseurl + "acceptTrade", {
        tradeId: tradeId
      });
      console.log('Trade accepted successfully');
      console.log(response.data);

    } catch (error) {
      console.error('Error accepting trade:', error);
      throw new Error('Failed to accept trade');
    }
  }

  async getMyGotchiItems(): Promise<any[]> {
    const snapshot = await this.firestore?.collection('gotchi')
      .doc(this.auth.currentUser?.uid).get();
    if (snapshot?.exists) {
      const data = snapshot.data();
      if (data && data['items']) {
        const filteredItems = data['items'].filter((item: any) => item.inUse === false);
        return filteredItems;
      }
    }

    return [];
  }
  async getSpecificItem(itemId) {
    const snapshot = await this.firestore?.collection('item').doc(itemId).get();
    return snapshot?.data();
  }

  async getItemsForOnlineUsers(userId) {
    try {
      const response = await axios.get(`http://127.0.0.1:5001/battlegotchi-63c2e/us-central1/api/onlineusers/${userId}/items`);
      return response.data.items;
    } catch (error) {
      console.error('Error retrieving items for online user:', error);
      throw new Error('Failed to retrieve items for online user');
    }
  }
}
