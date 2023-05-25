import { Injectable } from '@angular/core';
import {FireService} from "../fire.service";
import axios from "axios";

@Injectable({
  providedIn: 'root'
})
export class GotchiFireService extends FireService{

  constructor() {
    super();
  }

  async getGotchiSpecific() {
    const snapshot = await this.firestore.collection('gotchi').where('user', '==', this.auth.currentUser?.uid).get();
    const doc = snapshot.docs[0];
    return doc ? doc.data() : null;
  }

  async getMyDeath(): Promise<boolean> {
    try {
      const snapshot = await this.firestore
        .collection("gotchi")
        .where("user", "==", this.auth.currentUser?.uid)
        .get();

      return snapshot.empty; // If the snapshot is empty, the document has been deleted
    } catch (error) {
      throw error;
    }
  }

  async restart() {
    try {
      console.log("service")
      const response = await axios.post(this.baseurl + "restart", {
        user: this.auth.currentUser?.uid
      });
      console.log(response)
      return response.status == 200;
    }
    catch (error){
      throw error;
    }
  }

  async sendReq(reqString: string){
    const reqId = this.auth.currentUser?.uid;

    const response = await axios.post(this.baseurl + reqString, {reqId: reqId});

    if(response.status === 500){
      throw new Error("You've done you allotted amounts of this action today already")
    }
  }
}
