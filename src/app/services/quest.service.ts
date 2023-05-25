import { Injectable } from '@angular/core';
import { FireService } from "../fire.service";
import { userQuest } from "../../entities/userQuest";
import firebase from "firebase/compat/app";
import { quest } from "../../entities/quest";
import { item } from "../../entities/item";
import 'firebase/compat/firestore';
import 'firebase/compat/auth';


@Injectable({
  providedIn: 'root'
})
export class QuestService {

  constructor() {
    FireService.instance.auth.onAuthStateChanged((user) => {
      if (user) {
        // mark user as online on sign in
        FireService.instance.firestore.collection('users').doc(user.uid).update({ status: 'online' });

        this.unassignExpiredQuests();

      } else {
        // mark user as offline on sign out
        if (FireService.instance.auth.currentUser) {
          FireService.instance.firestore.collection('users').doc(FireService.instance.auth.currentUser.uid).update({ status: 'offline' });
        }
      }
    });
  }
  async getQuest(category: string): Promise<quest[]> {
    const quests: quest[] = [];

    try {
      const querySnapshot = await FireService.instance.firestore.collection("quests")
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
      return quests;
    } catch (error) {
      console.log("Failed to get quests:", error);
      throw new Error("Failed to get quests");
    }
  }
  async getUserQuests(): Promise<userQuest> {
    let userQuestDTO = new userQuest();

    try {
      const querySnapshot = await FireService.instance.firestore
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
      await FireService.instance.firestore.collection("users").doc(userId).update({ dailyQuest: newDailyQuest });
    }

    // Check and unassign weekly quest
    if (userQuests.weeklyQuest && userQuests.weeklyQuest.duration.end < currentDate) {
      const newWeeklyQuest = await this.assignNewQuest("weekly"); // Assign a new weekly quest
      await FireService.instance.firestore.collection("users").doc(userId).update({ weeklyQuest: newWeeklyQuest });
    }

    // Check and unassign monthly quest
    if (userQuests.monthlyQuest && userQuests.monthlyQuest.duration.end < currentDate) {
      const newMonthlyQuest = await this.assignNewQuest("monthly"); // Assign a new monthly quest
      await FireService.instance.firestore.collection("users").doc(userId).update({ monthlyQuest: newMonthlyQuest });
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
    const userQuests = await FireService.instance.firestore.collection("users").doc(userId).get();

    if (!userQuests.exists) {
      throw new Error("User quests not found");
    }

    const questFields = ["dailyQuest", "weeklyQuest", "monthlyQuest"];

    await FireService.instance.firestore.runTransaction(async (transaction) => {
      const gotchiDoc = await transaction.get(FireService.instance.firestore.collection("gotchi").doc(userId));
      const questDoc = await transaction.get(FireService.instance.firestore.collection("users").doc(userId));
      const itemdoc = await transaction.get(FireService.instance.firestore.collection("item").doc());

      if (!questDoc.exists) {
        throw new Error("Quest document not found");
      }

      for (const questField of questFields) {
        const quest = questDoc.data()![questField];

        if (quest && quest.duration.end <= currentDate && quest.action === action) {
          const currentProgress = quest.progress || 0;
          const completion = quest.completion || 0;

          console.log("Current Progress:", currentProgress);
          console.log("Completion:", completion);

          if (currentProgress < completion) {
            const newProgress = Math.min(currentProgress + increment, completion);
            console.log("New Progress:", newProgress);

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
}
