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
            action: doc.data()['action'],
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

  async getGotchiSpecific() {
    const snapshot = await this.firestore.collection('gotchi').where('user', '==', this.auth.currentUser?.uid).get();
    const doc = snapshot.docs[0];
    return doc ? doc.data() : null;
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
    const rewardPromise = this.randomItem(); // Get the promise from randomItem()
    const reward = await rewardPromise; // Await the resolution of the promise
    return {
      name: newQuest.name,
      description: newQuest.description,
      progress: newQuest.progress,
      duration: newQuest.duration,
      completion: newQuest.completion,
      category: newQuest.category,
      reward: reward, // Assign the resolved reward value
    };
  }

  async randomItem(): Promise<item> {
    const itemSnapshot = await firebase.firestore().collection('item').get();
    const itemDocs = itemSnapshot.docs;
    const randomItemDoc = itemDocs[Math.floor(Math.random() * itemDocs.length)];
    return randomItemDoc.data() as item;
  }

  dateSetter(startDay: number, endMonth: number, startHour: number, endHour: number): { start: Date, end: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startDate.setHours(startHour, 0, 0, 0);
    const endDate = new Date(2023, endMonth, startDay);
    endDate.setHours(endHour, 59, 59, 999);
    return { start: startDate, end: endDate };
  }

  async increaseQuestProgress(increment: number, action: string) {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) {
      return;
    }

    const currentDate = new Date();
    const userQuests = await this.firestore.collection("users").doc(userId).get();

    if (!userQuests.exists) {
      throw new Error("User quests not found");
    }

    const questFields = ["dailyQuest", "weeklyQuest", "monthlyQuest"];

    await this.firestore.runTransaction(async (transaction) => {
      const gotchiDoc = await transaction.get(this.firestore.collection("gotchi").doc(userId));
      const questDoc = await transaction.get(this.firestore.collection("users").doc(userId));

      if (!questDoc.exists) {
        throw new Error("Quest document not found");
      }

      for (const questField of questFields) {
        const quest = questDoc.data()![questField];

        if (quest && quest.duration.end <= currentDate && quest.action === action) {
          const newProgress = (quest.progress || 0) + increment;
          transaction.update(questDoc.ref, {
            [`${questField}.progress`]: newProgress,
          });

          // Check if the quest has been completed
          if (newProgress >= quest.completion) {
            const currentItems = gotchiDoc.data()?.['items'] || [];
            const updatedItems = [...currentItems, quest.reward];
            transaction.update(gotchiDoc.ref, {
              items: updatedItems,
            });
          }
        }
      }
    });
  }

  async mockQuestDataToFirebase() {
    const db = firebase.firestore();

    try {
      const dailyQuest: quest = {
        name: "Nap time!",
        description: "Sleep 2 times today.",
        action: "sleep",
        progress: 0,
        duration: this.dateSetter(24, 4, 0, 23),
        completion: 2,
        category: "daily",
        reward: null,
      };

      const dailyQuest2: quest = {
        name: "Nutrition is key!",
        description: "Eat 3 times today.",
        action: "eat",
        progress: 0,
        duration: this.dateSetter(24, 4, 0, 23),
        completion: 3,
        category: "daily",
        reward: null,
      };

      const dailyQuest3: quest = {
        name: "You're kinda smelly!",
        description: "Shower 2 times today.",
        action: "shower",
        progress: 0,
        duration: this.dateSetter(24, 4, 0, 23),
        completion: 2,
        category: "daily",
        reward: null,
      };

      const weeklyQuest: quest = {
        name: "Hungry little one you are!",
        description: "Eat 2 times this weak.",
        action: "eat",
        progress: 0,
        duration: this.dateSetter(22, 4, 0, 23),
        completion: 2,
        category: "weekly",
        reward: null,
      };

      const monthlyQuest: quest = {
        name: "Battle god",
        description: "Fight 20 times this month.",
        action: "battle",
        progress: 0,
        duration: this.dateSetter(31, 4, 0, 23),
        completion: 20,
        category: "monthly",
        reward: null,
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

  async getBattleNotificationsByResceiverId(receiverId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseurl}battlenotifications/${receiverId}`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving battle notifications:', error);
      throw new Error('Failed to retrieve battle notifications');
    }
  }

  async sendReq(reqString: string){
    const reqId = this.auth.currentUser?.uid;

    const response = await axios.post(this.baseurl + reqString, {reqId: reqId});

    if(response.status === 500){
      throw new Error("You've done you allotted amounts of this action today already")
    }
  }

  async getAllItems() {
    const snapshot = await this.firestore.collection('item').where('user', '==', this.auth.currentUser?.uid).get();
    return snapshot.docs.map(doc => doc.data());
  }

  async getEquippedItem(type) {
    const snapshot = await this.firestore.collection('item')
      .where('user', '==', this.auth.currentUser?.uid)
      .where("itemType","==", type)
      .where("inUse", "==", true)
      .get();
    return snapshot.docs.map(doc => doc.data());

  }

  async unequip(itemName, type) {
    try {
      const userId = this.auth.currentUser?.uid;
      const response = await axios.post(this.baseurl + "unequipItem", {reqId: userId, itemName: itemName, itemType: type });
      console.log(response)
      return response;

    } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to unequip item');
    }

  }

  async equip(itemName, type) {
    try {
      const userId = this.auth.currentUser?.uid;
      const response = await axios.post(this.baseurl + "equipItem", {reqId: userId, itemName: itemName, itemType: type });
      console.log(response)
      return response;

    } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to equip item');
    }
 }

  async mock() {
      try {
        const db = firebase.firestore();


        const weapon1Common = {
          itemName: "Blade of Shadows",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 40,
          additionalDEX: 50,
          additionalSTM: 25
        };

        const weapon2Common = {
          itemName: "Stormcaller",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 35,
          additionalDEX: 40,
          additionalSTM: 30
        };

        const weapon3Common = {
          itemName: "Frostbite",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 50,
          additionalDEX: 35,
          additionalSTM: 35
        };

        const weapon4Common = {
          itemName: "Venomstrike",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 45,
          additionalDEX: 55,
          additionalSTM: 20
        };

        const weapon5Common = {
          itemName: "Raging Inferno",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 60,
          additionalDEX: 50,
          additionalSTM: 40
        };

        const weapon6Common = {
          itemName: "Thunderclap",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 30,
          additionalDEX: 40,
          additionalSTM: 25
        };

        const weapon7Common = {
          itemName: "Doombringer",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 55,
          additionalDEX: 35,
          additionalSTM: 30
        };

        const weapon8Common = {
          itemName: "Soulrender",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 40,
          additionalDEX: 30,
          additionalSTM: 20
        };

        const weapon9Common = {
          itemName: "Whispering Death",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 50,
          additionalDEX: 60,
          additionalSTM: 35
        };

        const weapon10Common = {
          itemName: "Serpent's Fang",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 30,
          additionalDEX: 30,
          additionalSTM: 40
        };

        const weapon11Common = {
          itemName: "Molten Fury",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 45,
          additionalDEX: 40,
          additionalSTM: 25
        };

        const weapon12Common = {
          itemName: "Galeforce",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 55,
          additionalDEX: 50,
          additionalSTM: 30
        };

        const weapon13Common = {
          itemName: "Nightfall",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 40,
          additionalDEX: 45,
          additionalSTM: 20
        };

        const weapon14Common = {
          itemName: "Obsidian Slicer",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 60,
          additionalDEX: 50,
          additionalSTM: 35
        };

        const weapon15Common = {
          itemName: "Viper's Bite",
          itemType: "weapon",
          itemRarity: "common",
          armor: 0,
          additionalSTR: 35,
          additionalDEX: 30,
          additionalSTM: 25
        };
        const chestplate1Common = {
          itemName: "Plate of Protection",
          itemType: "chestplate",
          itemRarity: "common",
          armor: 50,
          additionalSTR: 20,
          additionalDEX: 15,
          additionalSTM: 10,
        };

        const chestplate2Common = {
          itemName: "Guardian's Embrace",
          itemType: "chestplate",
          itemRarity: "common",
          armor: 55,
          additionalSTR: 30,
          additionalDEX: 20,
          additionalSTM: 15,
        };

        const chestplate3Common = {
          itemName: "Knight's Valor",
          itemType: "chestplate",
          itemRarity: "common",
          armor: 45,
          additionalSTR: 25,
          additionalDEX: 15,
          additionalSTM: 10,
        };

        const chestplate4Common = {
          itemName: "Platinum Chestplate",
          itemType: "chestplate",
          itemRarity: "common",
          armor: 60,
          additionalSTR: 35,
          additionalDEX: 25,
          additionalSTM: 20,
        };

        const chestplate5Common = {
          itemName: "Defender's Plate",
          itemType: "chestplate",
          itemRarity: "common",
          armor: 50,
          additionalSTR: 30,
          additionalDEX: 20,
          additionalSTM: 15,
        };

        const chestplate6Common = {
          itemName: "Scalemail Vest",
          itemType: "chestplate",
          itemRarity: "common",
          armor: 40,
          additionalSTR: 15,
          additionalDEX: 10,
          additionalSTM: 10,
        };

        const chestplate7Common = {
          itemName: "Titanium Breastplate",
          itemType: "chestplate",
          itemRarity: "common",
          armor: 55,
          additionalSTR: 35,
          additionalDEX: 25,
          additionalSTM: 20,
        };

        const chestplate8Common = {
          itemName: "Sentinel's Guard",
          itemType: "chestplate",
          itemRarity: "common",
          armor: 50,
          additionalSTR: 25,
          additionalDEX: 20,
          additionalSTM: 15,
        };

        const chestplate9Common = {
          itemName: "Ironclad Chestpiece",
          itemType: "chestplate",
          itemRarity: "common",
          armor: 45,
          additionalSTR: 20,
          additionalDEX: 15,
          additionalSTM: 10,
        };

        const chestplate10Common = {
          itemName: "Bulwark Plate",
          itemType: "chestplate",
          itemRarity: "common",
          armor: 55,
          additionalSTR: 30,
          additionalDEX: 20,
          additionalSTM: 15,
        };

        const helmet1Common = {
          itemName: "Helm of Valor",
          itemType: "helmet",
          itemRarity: "common",
          armor: 30,
          additionalSTR: 15,
          additionalDEX: 20,
          additionalSTM: 10,
        };

        const helmet2Common = {
          itemName: "Guardian's Visage",
          itemType: "helmet",
          itemRarity: "common",
          armor: 25,
          additionalSTR: 10,
          additionalDEX: 30,
          additionalSTM: 20,
        };

        const helmet3Common = {
          itemName: "Steel Coif",
          itemType: "helmet",
          itemRarity: "common",
          armor: 35,
          additionalSTR: 20,
          additionalDEX: 15,
          additionalSTM: 10,
        };

        const helmet4Common = {
          itemName: "Silver Crown",
          itemType: "helmet",
          itemRarity: "common",
          armor: 40,
          additionalSTR: 20,
          additionalDEX: 25,
          additionalSTM: 15,
        };

        const helmet5Common = {
          itemName: "Hood of Shadows",
          itemType: "helmet",
          itemRarity: "common",
          armor: 30,
          additionalSTR: 10,
          additionalDEX: 35,
          additionalSTM: 25,
        };

        const helmet6Common = {
          itemName: "Plated Helm",
          itemType: "helmet",
          itemRarity: "common",
          armor: 25,
          additionalSTR: 15,
          additionalDEX: 10,
          additionalSTM: 20,
        };

        const helmet7Common = {
          itemName: "Crest of Protection",
          itemType: "helmet",
          itemRarity: "common",
          armor: 40,
          additionalSTR: 20,
          additionalDEX: 30,
          additionalSTM: 15,
        };

        const helmet8Common = {
          itemName: "Leather Hood",
          itemType: "helmet",
          itemRarity: "common",
          armor: 20,
          additionalSTR: 10,
          additionalDEX: 25,
          additionalSTM: 10,
        };

        const helmet9Common = {
          itemName: "Mystic Crown",
          itemType: "helmet",
          itemRarity: "common",
          armor: 30,
          additionalSTR: 15,
          additionalDEX: 20,
          additionalSTM: 15,
        };

        const helmet10Common = {
          itemName: "Visor of Agility",
          itemType: "helmet",
          itemRarity: "common",
          armor: 35,
          additionalSTR: 15,
          additionalDEX: 30,
          additionalSTM: 10,
        };

        const weapon1Rare = {
          itemName: "Blade of Thunder",
          itemType: "weapon",
          itemRarity: "rare",
          armor: 0,
          additionalSTR: 95,
          additionalDEX: 85,
          additionalSTM: 55,
        };

        const weapon2Rare = {
          itemName: "Soulreaper",
          itemType: "weapon",
          itemRarity: "rare",
          armor: 0,
          additionalSTR: 105,
          additionalDEX: 95,
          additionalSTM: 50,
        };

        const weapon3Rare = {
          itemName: "Whisperwind Bow",
          itemType: "weapon",
          itemRarity: "rare",
          armor: 0,
          additionalSTR: 85,
          additionalDEX: 115,
          additionalSTM: 45,
        };

        const weapon4Rare = {
          itemName: "Doombringer Axe",
          itemType: "weapon",
          itemRarity: "rare",
          armor: 0,
          additionalSTR: 110,
          additionalDEX: 75,
          additionalSTM: 60,
        };

        const weapon5Rare = {
          itemName: "Serrated Dagger",
          itemType: "weapon",
          itemRarity: "rare",
          armor: 0,
          additionalSTR: 75,
          additionalDEX: 105,
          additionalSTM: 40,
        };

        const weapon6Rare = {
          itemName: "Skullcrusher Mace",
          itemType: "weapon",
          itemRarity: "rare",
          armor: 0,
          additionalSTR: 100,
          additionalDEX: 80,
          additionalSTM: 50,
        };

        const weapon7Rare = {
          itemName: "Widowmaker Crossbow",
          itemType: "weapon",
          itemRarity: "rare",
          armor: 0,
          additionalSTR: 90,
          additionalDEX: 110,
          additionalSTM: 55,
        };

        const weapon8Rare = {
          itemName: "Stormstrike Staff",
          itemType: "weapon",
          itemRarity: "rare",
          armor: 0,
          additionalSTR: 95,
          additionalDEX: 100,
          additionalSTM: 45,
        };

        const weapon9Rare = {
          itemName: "Viper's Fang",
          itemType: "weapon",
          itemRarity: "rare",
          armor: 0,
          additionalSTR: 100,
          additionalDEX: 95,
          additionalSTM: 50,
        };

        const weapon10Rare = {
          itemName: "Ethereal Blade",
          itemType: "weapon",
          itemRarity: "rare",
          armor: 0,
          additionalSTR: 110,
          additionalDEX: 90,
          additionalSTM: 60,
        };

        const chestplate1Rare = {
          itemName: "Radiant Chestplate",
          itemType: "chestplate",
          itemRarity: "rare",
          armor: 95,
          additionalSTR: 55,
          additionalDEX: 60,
          additionalSTM: 35,
        };

        const chestplate2Rare = {
          itemName: "Crimson Battleplate",
          itemType: "chestplate",
          itemRarity: "rare",
          armor: 100,
          additionalSTR: 45,
          additionalDEX: 70,
          additionalSTM: 40,
        };

        const chestplate3Rare = {
          itemName: "Shimmering Scalemail",
          itemType: "chestplate",
          itemRarity: "rare",
          armor: 80,
          additionalSTR: 50,
          additionalDEX: 45,
          additionalSTM: 30,
        };

        const chestplate4Rare = {
          itemName: "Titanic Chestguard",
          itemType: "chestplate",
          itemRarity: "rare",
          armor: 115,
          additionalSTR: 60,
          additionalDEX: 75,
          additionalSTM: 45,
        };

        const chestplate5Rare = {
          itemName: "Serpentbane Vest",
          itemType: "chestplate",
          itemRarity: "rare",
          armor: 90,
          additionalSTR: 40,
          additionalDEX: 50,
          additionalSTM: 35,
        };

        const chestplate6Rare = {
          itemName: "Ironbark Plate",
          itemType: "chestplate",
          itemRarity: "rare",
          armor: 105,
          additionalSTR: 70,
          additionalDEX: 80,
          additionalSTM: 50,
        };

        const chestplate7Rare = {
          itemName: "Azure Breastplate",
          itemType: "chestplate",
          itemRarity: "rare",
          armor: 85,
          additionalSTR: 45,
          additionalDEX: 60,
          additionalSTM: 30,
        };

        const chestplate8Rare = {
          itemName: "Dreadforge Armor",
          itemType: "chestplate",
          itemRarity: "rare",
          armor: 120,
          additionalSTR: 80,
          additionalDEX: 70,
          additionalSTM: 50,
        };

        const chestplate9Rare = {
          itemName: "Obsidian Chestpiece",
          itemType: "chestplate",
          itemRarity: "rare",
          armor: 95,
          additionalSTR: 50,
          additionalDEX: 45,
          additionalSTM: 35,
        };

        const chestplate10Rare = {
          itemName: "Gilded Platemail",
          itemType: "chestplate",
          itemRarity: "rare",
          armor: 110,
          additionalSTR: 65,
          additionalDEX: 65,
          additionalSTM: 40,
        };

        const helmet1Rare = {
          itemName: "Dreadmist Helm",
          itemType: "helmet",
          itemRarity: "rare",
          armor: 60,
          additionalSTR: 50,
          additionalDEX: 75,
          additionalSTM: 45,
        };

        const helmet2Rare = {
          itemName: "Whisperwind Cowl",
          itemType: "helmet",
          itemRarity: "rare",
          armor: 55,
          additionalSTR: 40,
          additionalDEX: 70,
          additionalSTM: 50,
        };

        const helmet3Rare = {
          itemName: "Soulguard Helmet",
          itemType: "helmet",
          itemRarity: "rare",
          armor: 70,
          additionalSTR: 60,
          additionalDEX: 80,
          additionalSTM: 40,
        };

        const helmet4Rare = {
          itemName: "Stormcaller Crown",
          itemType: "helmet",
          itemRarity: "rare",
          armor: 75,
          additionalSTR: 45,
          additionalDEX: 60,
          additionalSTM: 60,
        };

        const helmet5Rare = {
          itemName: "Radiant Visage",
          itemType: "helmet",
          itemRarity: "rare",
          armor: 65,
          additionalSTR: 55,
          additionalDEX: 40,
          additionalSTM: 45,
        };

        const helmet6Rare = {
          itemName: "Gilded Helm",
          itemType: "helmet",
          itemRarity: "rare",
          armor: 80,
          additionalSTR: 35,
          additionalDEX: 65,
          additionalSTM: 55,
        };

        const helmet7Rare = {
          itemName: "Shadowstrike Hood",
          itemType: "helmet",
          itemRarity: "rare",
          armor: 50,
          additionalSTR: 60,
          additionalDEX: 50,
          additionalSTM: 40,
        };

        const helmet8Rare = {
          itemName: "Ironbark Coif",
          itemType: "helmet",
          itemRarity: "rare",
          armor: 85,
          additionalSTR: 65,
          additionalDEX: 80,
          additionalSTM: 50,
        };

        const helmet9Rare = {
          itemName: "Skullcrusher Helm",
          itemType: "helmet",
          itemRarity: "rare",
          armor: 60,
          additionalSTR: 30,
          additionalDEX: 75,
          additionalSTM: 60,
        };

        const helmet10Rare = {
          itemName: "Crimson Crown",
          itemType: "helmet",
          itemRarity: "rare",
          armor: 70,
          additionalSTR: 65,
          additionalDEX: 40,
          additionalSTM: 50,
        };

        const weapon1Legendary = {
          itemName: "Excalibur",
          itemType: "weapon",
          itemRarity: "legendary",
          armor: 0,
          additionalSTR: 185,
          additionalDEX: 150,
          additionalSTM: 95,
        };

        const weapon2Legendary = {
          itemName: "Mjolnir",
          itemType: "weapon",
          itemRarity: "legendary",
          armor: 0,
          additionalSTR: 175,
          additionalDEX: 190,
          additionalSTM: 100,
        };

        const weapon3Legendary = {
          itemName: "Gungnir",
          itemType: "weapon",
          itemRarity: "legendary",
          armor: 0,
          additionalSTR: 195,
          additionalDEX: 165,
          additionalSTM: 110,
        };

        const weapon4Legendary = {
          itemName: "Masamune",
          itemType: "weapon",
          itemRarity: "legendary",
          armor: 0,
          additionalSTR: 160,
          additionalDEX: 180,
          additionalSTM: 105,
        };

        const weapon5Legendary = {
          itemName: "Durandal",
          itemType: "weapon",
          itemRarity: "legendary",
          armor: 0,
          additionalSTR: 190,
          additionalDEX: 170,
          additionalSTM: 100,
        };

        const weapon6Legendary = {
          itemName: "Gram",
          itemType: "weapon",
          itemRarity: "legendary",
          armor: 0,
          additionalSTR: 200,
          additionalDEX: 135,
          additionalSTM: 80,
        };

        const weapon7Legendary = {
          itemName: "Caladbolg",
          itemType: "weapon",
          itemRarity: "legendary",
          armor: 0,
          additionalSTR: 155,
          additionalDEX: 195,
          additionalSTM: 90,
        };

        const weapon8Legendary = {
          itemName: "Claiomh Solais",
          itemType: "weapon",
          itemRarity: "legendary",
          armor: 0,
          additionalSTR: 175,
          additionalDEX: 150,
          additionalSTM: 95,
        };

        const weapon9Legendary = {
          itemName: "Hofud",
          itemType: "weapon",
          itemRarity: "legendary",
          armor: 0,
          additionalSTR: 185,
          additionalDEX: 160,
          additionalSTM: 105,
        };

        const weapon10Legendary = {
          itemName: "Joyeuse",
          itemType: "weapon",
          itemRarity: "legendary",
          armor: 0,
          additionalSTR: 170,
          additionalDEX: 175,
          additionalSTM: 90,
        };

        const chestplate1Legendary = {
          itemName: "Armor of the Phoenix",
          itemType: "chestplate",
          itemRarity: "legendary",
          armor: 190,
          additionalSTR: 135,
          additionalDEX: 130,
          additionalSTM: 85,
        };

        const chestplate2Legendary = {
          itemName: "Dragonscale Plate",
          itemType: "chestplate",
          itemRarity: "legendary",
          armor: 200,
          additionalSTR: 145,
          additionalDEX: 140,
          additionalSTM: 90,
        };

        const chestplate3Legendary = {
          itemName: "Titanium Chestguard",
          itemType: "chestplate",
          itemRarity: "legendary",
          armor: 185,
          additionalSTR: 150,
          additionalDEX: 135,
          additionalSTM: 100,
        };

        const chestplate4Legendary = {
          itemName: "Sentinel's Embrace",
          itemType: "chestplate",
          itemRarity: "legendary",
          armor: 180,
          additionalSTR: 140,
          additionalDEX: 130,
          additionalSTM: 105,
        };

        const chestplate5Legendary = {
          itemName: "Guardian's Plate",
          itemType: "chestplate",
          itemRarity: "legendary",
          armor: 195,
          additionalSTR: 130,
          additionalDEX: 140,
          additionalSTM: 95,
        };

        const chestplate6Legendary = {
          itemName: "Celestial Armor",
          itemType: "chestplate",
          itemRarity: "legendary",
          armor: 170,
          additionalSTR: 150,
          additionalDEX: 135,
          additionalSTM: 100,
        };

        const chestplate7Legendary = {
          itemName: "Eternal Aegis",
          itemType: "chestplate",
          itemRarity: "legendary",
          armor: 200,
          additionalSTR: 140,
          additionalDEX: 130,
          additionalSTM: 105,
        };

        const chestplate8Legendary = {
          itemName: "Dreadplate of the Conqueror",
          itemType: "chestplate",
          itemRarity: "legendary",
          armor: 185,
          additionalSTR: 145,
          additionalDEX: 140,
          additionalSTM: 90,
        };

        const chestplate9Legendary = {
          itemName: "Archon's Breastplate",
          itemType: "chestplate",
          itemRarity: "legendary",
          armor: 195,
          additionalSTR: 135,
          additionalDEX: 130,
          additionalSTM: 95,
        };

        const chestplate10Legendary = {
          itemName: "Majestic Warplate",
          itemType: "chestplate",
          itemRarity: "legendary",
          armor: 175,
          additionalSTR: 150,
          additionalDEX: 140,
          additionalSTM: 100,
        };

        const helmet1Legendary = {
          itemName: "Helm of the Celestial",
          itemType: "helmet",
          itemRarity: "legendary",
          armor: 120,
          additionalSTR: 85,
          additionalDEX: 100,
          additionalSTM: 70,
        };

        const helmet2Legendary = {
          itemName: "Crown of the Phoenix",
          itemType: "helmet",
          itemRarity: "legendary",
          armor: 130,
          additionalSTR: 90,
          additionalDEX: 110,
          additionalSTM: 80,
        };

        const helmet3Legendary = {
          itemName: "Visage of the Guardian",
          itemType: "helmet",
          itemRarity: "legendary",
          armor: 140,
          additionalSTR: 95,
          additionalDEX: 120,
          additionalSTM: 90,
        };

        const helmet4Legendary = {
          itemName: "Mask of the Eternal",
          itemType: "helmet",
          itemRarity: "legendary",
          armor: 150,
          additionalSTR: 100,
          additionalDEX: 130,
          additionalSTM: 100,
        };

        const helmet5Legendary = {
          itemName: "Helm of the Titan",
          itemType: "helmet",
          itemRarity: "legendary",
          armor: 110,
          additionalSTR: 70,
          additionalDEX: 85,
          additionalSTM: 70,
        };

        const helmet6Legendary = {
          itemName: "Crown of the Archon",
          itemType: "helmet",
          itemRarity: "legendary",
          armor: 125,
          additionalSTR: 80,
          additionalDEX: 100,
          additionalSTM: 80,
        };

        const helmet7Legendary = {
          itemName: "Visage of the Seraph",
          itemType: "helmet",
          itemRarity: "legendary",
          armor: 135,
          additionalSTR: 85,
          additionalDEX: 110,
          additionalSTM: 90,
        };

        const helmet8Legendary = {
          itemName: "Mask of the Dreadlord",
          itemType: "helmet",
          itemRarity: "legendary",
          armor: 145,
          additionalSTR: 90,
          additionalDEX: 120,
          additionalSTM: 100,
        };

        const helmet9Legendary = {
          itemName: "Helm of the Warlord",
          itemType: "helmet",
          itemRarity: "legendary",
          armor: 115,
          additionalSTR: 75,
          additionalDEX: 90,
          additionalSTM: 70,
        };

        const helmet10Legendary = {
          itemName: "Crown of the Conqueror",
          itemType: "helmet",
          itemRarity: "legendary",
          armor: 130,
          additionalSTR: 85,
          additionalDEX: 105,
          additionalSTM: 80,
        };
        let list = [weapon1Common, weapon2Common, weapon3Common, weapon4Common, weapon5Common, weapon6Common, weapon7Common,
          weapon8Common, weapon9Common, weapon10Common, weapon11Common, weapon12Common, weapon13Common, weapon14Common, weapon15Common,
          chestplate1Common, chestplate2Common, chestplate3Common, chestplate4Common, chestplate5Common, chestplate6Common, chestplate7Common,
          chestplate8Common, chestplate9Common, chestplate10Common, helmet1Common, helmet2Common, helmet3Common, helmet4Common, helmet5Common,
          helmet6Common, helmet7Common, helmet8Common, helmet9Common, helmet10Common, weapon1Rare, weapon2Rare, weapon3Rare, weapon4Rare, weapon5Rare,
          weapon6Rare, weapon7Rare, weapon8Rare, weapon9Rare, weapon10Rare, chestplate1Rare, chestplate2Rare, chestplate3Rare, chestplate4Rare,
          chestplate5Rare, chestplate6Rare, chestplate7Rare, chestplate8Rare, chestplate9Rare, chestplate10Rare, helmet1Rare, helmet2Rare, helmet3Rare,
          helmet4Rare, helmet5Rare, helmet6Rare, helmet7Rare, helmet8Rare, helmet9Rare, helmet10Rare, weapon1Legendary, weapon2Legendary, weapon3Legendary,
          weapon4Legendary, weapon5Legendary, weapon6Legendary, weapon7Legendary, weapon8Legendary, weapon9Legendary, weapon10Legendary, chestplate1Legendary,
          chestplate2Legendary, chestplate3Legendary, chestplate4Legendary, chestplate5Legendary, chestplate6Legendary, chestplate7Legendary, chestplate8Legendary,
          chestplate9Legendary, chestplate10Legendary, helmet1Legendary, helmet2Legendary, helmet3Legendary, helmet4Legendary, helmet5Legendary,
          helmet6Legendary, helmet7Legendary, helmet8Legendary, helmet9Legendary, helmet10Legendary]

        await list.forEach(item => db.collection("item").add(item));
        console.log("Mock quest data has been sent to Firebase");
      } catch (error) {
        console.log("Failed to send mock quest data to Firebase:", error);
      }
    }

}


