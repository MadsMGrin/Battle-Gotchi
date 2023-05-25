import { Injectable } from '@angular/core';
import {FirebaseInitService} from "../fire.service";
import {userQuest} from "../../entities/userQuest";
import {quest} from "../../entities/quest";
import {item} from "../../entities/item";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import {BaseService} from "./baseService";

@Injectable({
  providedIn: 'root'
})
export class QuestService extends BaseService {

  constructor(firebaseInitService: FirebaseInitService) {
    super(firebaseInitService);
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        // mark user as online on sign in
        this.firestore?.collection('users').doc(user.uid).update({ status: 'online' });

        this.unassignExpiredQuests();

      } else {
        // mark user as offline on sign out
        if (this.auth.currentUser) {
          this.firestore?.collection('users').doc(this.auth.currentUser.uid).update({ status: 'offline' });
        }
      }
    });
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
  async getQuest(category: string): Promise<quest[]> {
    const quests: quest[] = [];

    try {
      const querySnapshot = await this.firestore.collection("quests")
        .where("category", "==", category)
        .get();

      querySnapshot?.forEach((doc) => {
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
        }
      });
      return quests;
    } catch (error) {
      throw new Error("Failed to get quests");
    }
  }
  async getUserQuests(): Promise<userQuest> {
    let userQuestDTO = new userQuest();

    try {
      const querySnapshot = await this.firestore.collection("users")
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
    }

    return userQuestDTO;
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
  dateSetter(endDay: number, endMonth: number, startHour: number, endHour: number): { start: Date, end: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startDate.setHours(startHour, 0, 0, 0);
    const endDate = new Date(2023, endMonth, endDay);
    endDate.setHours(endHour, 59, 59, 999);
    return { start: startDate, end: endDate };
  }
  async increaseQuestProgress(increment: number, action: string) {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) {
      return;
    }

    const currentDate = new Date();
    const userQuests = await this.firestore?.collection("users").doc(userId).get();

    if (!userQuests?.exists) {
      throw new Error("User quests not found");
    }

    const questFields = ["dailyQuest", "weeklyQuest", "monthlyQuest"];

    await this.firestore?.runTransaction(async (transaction) => {
      const gotchiDoc = await transaction.get(this.firestore!.collection("gotchi").doc(userId));
      const questDoc = await transaction.get(this.firestore!.collection("users").doc(userId));
      const itemdoc = await transaction.get(this.firestore!.collection("item").doc());

      if (!questDoc.exists) {
        throw new Error("Quest document not found");
      }

      for (const questField of questFields) {
        const quest = questDoc.data()![questField];

        if (quest && quest.duration.end <= currentDate && quest.action === action) {
          const currentProgress = quest.progress || 0;
          const completion = quest.completion || 0;

          if (currentProgress < completion) {
            const newProgress = Math.min(currentProgress + increment, completion);

            transaction.update(questDoc.ref, {
              [`${questField}.progress`]: newProgress,
            });

            // Check if the quest has been completed
            if (newProgress >= completion) {
              const currentItems = gotchiDoc.data()?.['items'] || [];
              const rewardItem = quest.reward;
              const ownerId = itemdoc.id;

              const rewardWithOwner = { ...rewardItem, ownerId };

              if (!currentItems.some(item => item === rewardItem)) {
                const updatedItems = [...currentItems, rewardWithOwner];
                transaction.update(gotchiDoc.ref, {
                  items: updatedItems
                });
              }
            }


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
        duration: this.dateSetter(12, 5, 0, 23),
        completion: 2,
        category: "daily",
        reward: null,
      };

      const dailyQuest2: quest = {
        name: "Nutrition is key!",
        description: "Eat 3 times today.",
        action: "eat",
        progress: 0,
        duration: this.dateSetter(12, 5, 0, 23),
        completion: 3,
        category: "daily",
        reward: null,
      };

      const dailyQuest3: quest = {
        name: "You're kinda smelly!",
        description: "Shower 2 times today.",
        action: "shower",
        progress: 0,
        duration: this.dateSetter(12, 5, 0, 23),
        completion: 2,
        category: "daily",
        reward: null,
      };

      const weeklyQuest: quest = {
        name: "Hungry little one you are!",
        description: "Eat 2 times this weak.",
        action: "eat",
        progress: 0,
        duration: this.dateSetter(12, 5, 0, 23),
        completion: 2,
        category: "weekly",
        reward: null,
      };

      const monthlyQuest: quest = {
        name: "Battle god",
        description: "Fight 20 times this month.",
        action: "battle",
        progress: 0,
        duration: this.dateSetter(12, 5, 0, 23),
        completion: 20,
        category: "monthly",
        reward: null,
      };

      // Add the daily quests to Firestore with random IDs
      await db.collection("quests").add(dailyQuest);
      await db.collection("quests").add(dailyQuest2);
      await db.collection("quests").add(dailyQuest3);

      // Add the weekly quest to Firestore with a random ID
      await db.collection("quests").add(weeklyQuest);

      // Add the monthly quest to Firestore with a random ID
      await db.collection("quests").add(monthlyQuest);

    } catch (error) {
    }
  }
}
