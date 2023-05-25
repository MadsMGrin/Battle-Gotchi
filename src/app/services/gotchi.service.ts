import { Injectable } from '@angular/core';
import {FirebaseInitService} from "../fire.service";
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import axios from "axios";
import {BaseService} from "./baseService";

@Injectable({
  providedIn: 'root'
})
export class GotchiFireService extends BaseService{

  constructor(firebaseInitService: FirebaseInitService) {
    super(firebaseInitService);
  }

  async getGotchiSpecific() {
    const currentUser = this.auth.currentUser;

    if (currentUser) {
      const querySnapshot = await this.firestore?.collection('gotchi').where('user', '==', currentUser.uid).get();
      console.log('Current user UID:', currentUser.uid);
      console.log('Query snapshot:', querySnapshot);

      if (querySnapshot && !querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        console.log('Document:', doc);
        return doc ? doc.data() : null;
      }
    }

    return null;
  }

  async getMyDeath(): Promise<boolean> {
    try {
      const snapshot = await this.firestore?.collection("gotchi")
        .where("user", "==", this.auth.currentUser?.uid)
        .get();

      return snapshot!.empty; // If the snapshot is empty, the document has been deleted
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
