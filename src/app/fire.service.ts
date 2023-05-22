import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import axios from 'axios'
import * as config from '../../firebaseconfig.js'
import { gotchi } from "../entities/gotchi";
import {quest} from "../entities/quest";
import {userQuest} from "../entities/userQuest";
import {timestamp} from "rxjs";

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

        this.unassignExpiredQuests();

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
      console.log(quests);
      return quests;
    } catch (error) {
      console.log("Failed to get quests:", error);
      throw new Error("Failed to get quests");
    }
  }

  async register(email, password, username) {
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
      return {
        name: quest.name,
        description: quest.description,
        progress: quest.progress,
        duration: quest.duration,
        completion: quest.completion,
        category: quest.category,
        reward: quest.reward,
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
  }

  async getRandomQuest(category: string): Promise<quest> {
    const quests = await this.getQuest(category);
    const randomIndex = Math.floor(Math.random() * quests.length);
    return quests[randomIndex];
  }

  async unassignExpiredQuests() {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) {
      return;
    }

    const userQuests = await this.getUserQuests();
    const currentDate = new Date();

    // Check and unassign daily quest
    if (userQuests.dailyQuest && userQuests.dailyQuest.duration.end < currentDate) {
      const newDailyQuest = await this.assignNewQuest("daily"); // Assign a new daily quest
      await this.firestore.collection("users").doc(userId).update({ dailyQuest: newDailyQuest });
      console.log(newDailyQuest)
    }

    // Check and unassign weekly quest
    if (userQuests.weeklyQuest && userQuests.weeklyQuest.duration.end < currentDate) {
      const newWeeklyQuest = await this.assignNewQuest("weekly"); // Assign a new weekly quest
      await this.firestore.collection("users").doc(userId).update({ weeklyQuest: newWeeklyQuest });
    }

    // Check and unassign monthly quest
    if (userQuests.monthlyQuest && userQuests.monthlyQuest.duration.end < currentDate) {
      const newMonthlyQuest = await this.assignNewQuest("monthly"); // Assign a new monthly quest
      await this.firestore.collection("users").doc(userId).update({ monthlyQuest: newMonthlyQuest });
    }
  }

  async assignNewQuest(category: string): Promise<quest> {
    const newQuest = await this.getRandomQuest(category);
    if (!newQuest) {
      throw new Error('Failed to get new quest');
    }
    return {
      name: newQuest.name,
      description: newQuest.description,
      progress: newQuest.progress,
      duration: newQuest.duration,
      completion: newQuest.completion,
      category: newQuest.category,
      reward: newQuest.reward,
    };
  }

  dateSetter(days: number, startHour: number, endHour: number): { start: Date, end: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startDate.setHours(startHour, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days - 1);
    endDate.setHours(endHour, 50, 0, 999);
    return { start: startDate, end: endDate };
  }

  async mockQuestDataToFirebase() {
    const db = firebase.firestore();

    try {
      const dailyQuest: quest = {
        name: "Daily Quest",
        description: "Fuck Jen",
        progress: 0,
        duration: this.dateSetter(1, 0, 14),
        completion: false,
        category: "daily",
        reward: "Daily Reward",
      };

      const dailyQuest2: quest = {
        name: "Daily Quest 2",
        description: "Fuck Marcus",
        progress: 0,
        duration: this.dateSetter(1, 0, 14),
        completion: false,
        category: "daily",
        reward: "Daily Reward",
      };

      const dailyQuest3: quest = {
        name: "Daily Quest 3",
        description: "Fuck Filip",
        progress: 0,
        duration: this.dateSetter(1, 0, 14),
        completion: false,
        category: "daily",
        reward: "Daily Reward",
      };

      const weeklyQuest: quest = {
        name: "Weekly Quest",
        description: "Complete a weekly task",
        progress: 0,
        duration: this.dateSetter(7, 0, 23),
        completion: false,
        category: "weekly",
        reward: "Weekly Reward",
      };

      const monthlyQuest: quest = {
        name: "Monthly Quest",
        description: "Complete a monthly task",
        progress: 0,
        duration: this.dateSetter(30, 0, 23),
        completion: false,
        category: "monthly",
        reward: "Monthly Reward",
      };

      console.log(dailyQuest);
      console.log(dailyQuest2);
      console.log(dailyQuest3);
      console.log(weeklyQuest);
      console.log(monthlyQuest);

      // Add the daily quests to Firestore with random IDs
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

  async signIn(email: string, password: string) {
    await this.auth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    await this.auth.signOut();
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
