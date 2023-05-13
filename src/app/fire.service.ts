import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import * as config from '../../firebaseconfig.js'
import {gotchi} from "../entities/gotchi";
import {item} from "../entities/item";

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
    this.auth.useEmulator("http://localhost:9099");
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

  async createItem(){
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    const itemDTO: item = {
      user: user.uid,
      itemName: "Black Sword",
      itemType: "weapon",
      itemImg: "URL of img",
      armor: 0,
      additionalSTR: 30,
      additionalDEX: 10,
      additionalSTM: 20,
    }
    await this.firestore.collection('item').add(itemDTO);
  }

  async getAllUsersItems(): Promise<item>{
    var itemDTO = new item()

    await this.firestore.collection("item").where("user", "==", firebase.auth().currentUser?.uid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if(doc.exists){
            console.log(doc.data())
            itemDTO = {
              itemName: doc.data()['itemName'],
              itemType:doc.data()['itemType'],
              itemImg:doc.data()['itemImg'],
              armor:doc.data()['armor'],
              additionalSTR:doc.data()['additionalSTR'],
              additionalDEX:doc.data()['additionalDEX'],
              additionalSTM:doc.data()['additionalSTM'],
            }
            return itemDTO;

          }
          else {console.log("You have no item");
            return itemDTO;
          }
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
    return itemDTO;
  }
}
