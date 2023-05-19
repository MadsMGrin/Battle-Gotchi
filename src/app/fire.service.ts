import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import axios from 'axios'
import * as config from '../../firebaseconfig.js'
import { gotchi } from "../entities/gotchi";
import {quest} from "../entities/quest";
import {userQuest} from "../entities/userQuest";
import {FormControl} from "@angular/forms";

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
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        // mark user as online on sign in
        this.firestore.collection('users').doc(user.uid).update({ status: 'online' });

        // Check quest expiration for the user
        this.checkQuestExpiration(user.uid, 'daily');
        this.checkQuestExpiration(user.uid, 'weekly');
        this.checkQuestExpiration(user.uid, 'monthly');
      } else {
        // mark user as offline on sign out
        if (this.auth.currentUser) {
          this.firestore.collection('users').doc(this.auth.currentUser.uid).update({ status: 'offline' });
        }
      }
    });

  }

  async getUserQuests(): Promise<userQuest> {
    let userQuestDTO = new userQuest();

    try {
      const querySnapshot = await this.firestore
        .collection("users")
        .doc(firebase.auth().currentUser?.uid)
        .get();

      if (querySnapshot.exists) {
        const data = querySnapshot.data();
        if (data) {
          userQuestDTO.dailyQuest = data["dailyQuest"];
          userQuestDTO.weeklyQuest = data["weeklyQuest"];
          userQuestDTO.monthlyQuest = data["monthlyQuest"];
        }
      }
    } catch (error) {
      console.log("Error getting documents: ", error);
    }

    return userQuestDTO;
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

    try {
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
    } catch (error) {
      console.log("Failed to get quests:", error);
      throw new Error("Failed to get quests");
    }
  }

  async checkQuestExpiration(userId: string, questType: string) {
    const db = firebase.firestore();

    try {
      // Get the user document
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const questField = `${questType}Quest`;

        // Check if the quest is assigned and not completed
        // @ts-ignore
        if (userDoc.data() && userDoc.data()[questField] && !userDoc.data()[questField].completion) {
          // @ts-ignore
          const quest = userDoc.data()[questField];

          // Get the current timestamp
          const currentTimestamp = Math.floor(Date.now() / 1000);

          // Check if the quest has expired
          if (currentTimestamp > quest.duration) {
            // Mark the quest as expired
            await db.collection('users').doc(userId).update({
              [questField]: {
                name: '',
                description: '',
                progress: 0,
                duration: 0,
                completion: false,
                category: '',
                reward: ''
              }
            });

            // Assign a new random quest
            const newQuest = await this.getRandomQuest(questType);
            if (!newQuest) {
              throw new Error('Failed to get a new quest');
            }

            await db.collection('users').doc(userId).update({
              [questField]: {
                name: newQuest.name,
                description: newQuest.description,
                progress: newQuest.progress,
                duration: newQuest.duration,
                completion: newQuest.completion,
                category: newQuest.category,
                reward: newQuest.reward
              }
            });
          }
        }
      }
    } catch (error) {
      console.log('Failed to check quest expiration:', error);
      throw new Error('Failed to check quest expiration');
    }
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
      const dailyQuest = await this.getRandomQuest('daily');
      const weeklyQuest = await this.getRandomQuest('weekly');
      const monthlyQuest = await this.getRandomQuest('monthly');

      if (!dailyQuest || !weeklyQuest || !monthlyQuest) {
        throw new Error('Failed to get quests');
      }

      await db.collection('users').doc(userId).set({
        username: username,
        email: email,
        status: 'online',
        dailyQuest: {
          name: dailyQuest.name,
          description: dailyQuest.description,
          progress: dailyQuest.progress,
          duration: dailyQuest.duration,
          completion: dailyQuest.completion,
          category: dailyQuest.category,
          reward: dailyQuest.reward
        },
        weeklyQuest: {
          name: weeklyQuest.name,
          description: weeklyQuest.description,
          progress: weeklyQuest.progress,
          duration: weeklyQuest.duration,
          completion: weeklyQuest.completion,
          category: weeklyQuest.category,
          reward: weeklyQuest.reward
        },
        monthlyQuest: {
          name: monthlyQuest.name,
          description: monthlyQuest.description,
          progress: monthlyQuest.progress,
          duration: monthlyQuest.duration,
          completion: monthlyQuest.completion,
          category: monthlyQuest.category,
          reward: monthlyQuest.reward
        }
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

  private async getRandomQuest(category: string): Promise<quest> {
    const quests = await this.getQuest(category);
    const randomIndex = Math.floor(Math.random() * quests.length);
    return quests[randomIndex];
  }

  async signIn(email: string, password: string) {
    await this.auth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    await this.auth.signOut();
  }

  async mockQuestDataToFirebase() {
    const db = firebase.firestore();

    try {
      const dailyQuest: quest = {
        name: "Daily Quest",
        description: "Complete a daily task",
        progress: 0,
        duration: 120,
        completion: false,
        category: "daily",
        reward: "Daily Reward"
      };

      const dailyQuest2: quest = {
        name: "Daily Quest 2",
        description: "Complete a daily task",
        progress: 0,
        duration: 120,
        completion: false,
        category: "daily",
        reward: "Daily Reward"
      };

      const dailyQuest3: quest = {
        name: "Daily Quest 2",
        description: "Complete a daily task",
        progress: 0,
        duration: 120,
        completion: false,
        category: "daily",
        reward: "Daily Reward"
      };

      const weeklyQuest: quest = {
        name: "Weekly Quest",
        description: "Complete a weekly task",
        progress: 0,
        duration: 604800,
        completion: false,
        category: "weekly",
        reward: "Weekly Reward"
      };

      const monthlyQuest: quest = {
        name: "Monthly Quest",
        description: "Complete a monthly task",
        progress: 0,
        duration: 2630000,
        completion: false,
        category: "monthly",
        reward: "Monthly Reward"
      };

      // Add the daily quest to Firestore with a random ID
      await db.collection("quests").add(dailyQuest);

      await db.collection("quests").add(dailyQuest2);

      await db.collection("quests").add(dailyQuest3);

      // Add the weekly quest to Firestore with a random ID
      await db.collection("quests").add(weeklyQuest);

      // Add the monthly quest to Firestore with a random ID
      await db.collection("quests").add(monthlyQuest);

      console.log("Mock quest data has been sent to Firebase");
    } catch (error) {
      console.log("Failed to send mock quest data to Firebase:", error);
    }
  }
  async getOnlineUsers() {
    try {
      const response = await axios.get('http://127.0.0.1:5001/battlegotchi-63c2e/us-central1/api/onlineusers');
      const onlineUsers = response.data.filter(user => user.uid !== this.auth.currentUser?.uid)
        .map(user => ({ username: user.username, uid: user.uid }));
      return onlineUsers;
    } catch (error) {
      console.error('Error retrieving online users:', error);
      throw new Error('Failed to retrieve online users');
    }
  }

  // method used for sending battle request to another user.
  async sendBattleRequest(receiverId: string): Promise<void> {
    console.log('Current user:', this.auth.currentUser, 'UID:', this.auth.currentUser?.uid, 'Receiver ID:', receiverId);

    const senderId = this.auth.currentUser?.uid;

    if (!receiverId || !senderId) {
      throw new Error('User IDs not provided');
    }
    const senderReferfance = this.firestore.collection('users').doc(senderId);
    const senderDoc = await senderReferfance.get();
    const cooldownTimestamp = senderDoc.data()?.['cooldownTimestamp'] || 0;
    const currentTimestamp = firebase.firestore.Timestamp.now().toMillis();

    if (currentTimestamp < cooldownTimestamp) {
      throw new Error('Stop Spamming people');
    }

    const battleRequest = {
      senderId: senderId,
      receiverId: receiverId,
      status: 'pending'
    };

    await this.firestore.collection('battleRequests').add(battleRequest);

    // cooldown is set to 1min for now,
    const cooldownPeriod = 60000;
    const newCooldownTimestamp = currentTimestamp + cooldownPeriod;
    await senderReferfance.update({ ['cooldownTimestamp']: newCooldownTimestamp });
  }

  async sendReq(reqString: string){
    const reqId = this.auth.currentUser?.uid;

    const response = await axios.post(this.baseurl + reqString, {reqId: reqId});

    if(response.status === 450){
      throw new Error("You've done you allotted amounts of this action today already")
    }
  }

}
