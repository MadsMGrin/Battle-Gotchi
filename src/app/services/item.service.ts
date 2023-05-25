import { Injectable } from '@angular/core';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import axios from "axios";
import {BaseService} from "./baseService";
import {FirebaseInitService} from "../fire.service";

@Injectable({
  providedIn: 'root'
})
export class ItemService extends BaseService{

  constructor(firebaseInitService: FirebaseInitService) {
    super(firebaseInitService);
  }
  async getAllItems() {
    const snapshot = await this.firestore?.collection('gotchi')
      .doc(this.auth.currentUser?.uid).get();
    if (snapshot?.exists) {
      const data = snapshot.data();
      if (data && data['items']) {
        return data['items'];
      }
    }
    return [];
  }

  async getAllItemsOfType(type) {
    const snapshot = await this.firestore?.collection('gotchi')
      .doc(this.auth.currentUser?.uid)
      .get();
    if (snapshot?.exists) {
      const data = snapshot.data();
      if (data && data['items']) {
        const items = data['items'];
        return items.filter(item => item.itemType === type);
      }
    }
    return [];
  }

  async getEquippedItem(type) {
    const snapshot = await this.firestore?.collection('gotchi')
      .doc(this.auth.currentUser?.uid)
      .get();
    if (snapshot?.exists) {
      const data = snapshot.data();
      if (data && data['items']) {
        const items = data['items'];
        return items.filter(item => item.itemType === type && item.inUse === true);
      }
    }
    return [];
  }

  async unequip(itemName, type) {
    try {
      const user = this.auth.currentUser?.uid;
      const response = await axios.post(this.baseurl + "unequipItem", {userId: user, itemName: itemName, itemType: type });
      return response;
    } catch (error) {
      throw new Error('Failed to unequip item');
    }
  }

  async removeStats(itemName){
    try {
      const user = this.auth.currentUser?.uid;
      const response = await axios.post(this.baseurl + "removeStats", {userId: user, itemName: itemName});
      return response;

    } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to remove stats');
    }
  }

  async equip(itemName, type) {
    try {
      const user = this.auth.currentUser?.uid;
      const response = await axios.post(this.baseurl + "equipItem", {userId: user, itemName: itemName, itemType: type });
      return response;

    } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to equip item');
    }
  }
  async addStats(itemName){
    try {
      const user = this.auth.currentUser?.uid;
      const response = await axios.post(this.baseurl + "addStats", {userId: user, itemName: itemName});
      return response;

    } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to add stats');
    }

  }
  async mock() {
    try {
      const db = firebase.firestore();


      const weapon1Common = {
        inUse: false,
        itemName: "Blade of Shadows",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 40,
        additionalDEX: 50,
        additionalSTM: 25
      };

      const weapon2Common = {
        inUse: false,
        itemName: "Stormcaller",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 35,
        additionalDEX: 40,
        additionalSTM: 30
      };

      const weapon3Common = {
        inUse: false,
        itemName: "Frostbite",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 50,
        additionalDEX: 35,
        additionalSTM: 35
      };

      const weapon4Common = {
        inUse: false,
        itemName: "Venomstrike",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 45,
        additionalDEX: 55,
        additionalSTM: 20
      };

      const weapon5Common = {
        inUse: false,
        itemName: "Raging Inferno",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 60,
        additionalDEX: 50,
        additionalSTM: 40
      };

      const weapon6Common = {
        inUse: false,
        itemName: "Thunderclap",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 30,
        additionalDEX: 40,
        additionalSTM: 25
      };

      const weapon7Common = {
        inUse: false,
        itemName: "Doombringer",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 55,
        additionalDEX: 35,
        additionalSTM: 30
      };

      const weapon8Common = {
        inUse: false,
        itemName: "Soulrender",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 40,
        additionalDEX: 30,
        additionalSTM: 20
      };

      const weapon9Common = {
        inUse: false,
        itemName: "Whispering Death",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 50,
        additionalDEX: 60,
        additionalSTM: 35
      };

      const weapon10Common = {
        inUse: false,
        itemName: "Serpent's Fang",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 30,
        additionalDEX: 30,
        additionalSTM: 40
      };

      const weapon11Common = {
        inUse: false,
        itemName: "Molten Fury",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 45,
        additionalDEX: 40,
        additionalSTM: 25
      };

      const weapon12Common = {
        inUse: false,
        itemName: "Galeforce",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 55,
        additionalDEX: 50,
        additionalSTM: 30
      };

      const weapon13Common = {
        inUse: false,
        itemName: "Nightfall",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 40,
        additionalDEX: 45,
        additionalSTM: 20
      };

      const weapon14Common = {
        inUse: false,
        itemName: "Obsidian Slicer",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 60,
        additionalDEX: 50,
        additionalSTM: 35
      };

      const weapon15Common = {
        inUse: false,
        itemName: "Viper's Bite",
        itemType: "weapon",
        itemRarity: "common",
        armor: 0,
        additionalSTR: 35,
        additionalDEX: 30,
        additionalSTM: 25
      };
      const chestplate1Common = {
        inUse: false,
        itemName: "Plate of Protection",
        itemType: "chestplate",
        itemRarity: "common",
        armor: 50,
        additionalSTR: 20,
        additionalDEX: 15,
        additionalSTM: 10,
      };

      const chestplate2Common = {
        inUse: false,
        itemName: "Guardian's Embrace",
        itemType: "chestplate",
        itemRarity: "common",
        armor: 55,
        additionalSTR: 30,
        additionalDEX: 20,
        additionalSTM: 15,
      };

      const chestplate3Common = {
        inUse: false,
        itemName: "Knight's Valor",
        itemType: "chestplate",
        itemRarity: "common",
        armor: 45,
        additionalSTR: 25,
        additionalDEX: 15,
        additionalSTM: 10,
      };

      const chestplate4Common = {
        inUse: false,
        itemName: "Platinum Chestplate",
        itemType: "chestplate",
        itemRarity: "common",
        armor: 60,
        additionalSTR: 35,
        additionalDEX: 25,
        additionalSTM: 20,
      };

      const chestplate5Common = {
        inUse: false,
        itemName: "Defender's Plate",
        itemType: "chestplate",
        itemRarity: "common",
        armor: 50,
        additionalSTR: 30,
        additionalDEX: 20,
        additionalSTM: 15,
      };

      const chestplate6Common = {
        inUse: false,
        itemName: "Scalemail Vest",
        itemType: "chestplate",
        itemRarity: "common",
        armor: 40,
        additionalSTR: 15,
        additionalDEX: 10,
        additionalSTM: 10,
      };

      const chestplate7Common = {
        inUse: false,
        itemName: "Titanium Breastplate",
        itemType: "chestplate",
        itemRarity: "common",
        armor: 55,
        additionalSTR: 35,
        additionalDEX: 25,
        additionalSTM: 20,
      };

      const chestplate8Common = {
        inUse: false,
        itemName: "Sentinel's Guard",
        itemType: "chestplate",
        itemRarity: "common",
        armor: 50,
        additionalSTR: 25,
        additionalDEX: 20,
        additionalSTM: 15,
      };

      const chestplate9Common = {
        inUse: false,
        itemName: "Ironclad Chestpiece",
        itemType: "chestplate",
        itemRarity: "common",
        armor: 45,
        additionalSTR: 20,
        additionalDEX: 15,
        additionalSTM: 10,
      };

      const chestplate10Common = {
        inUse: false,
        itemName: "Bulwark Plate",
        itemType: "chestplate",
        itemRarity: "common",
        armor: 55,
        additionalSTR: 30,
        additionalDEX: 20,
        additionalSTM: 15,
      };

      const helmet1Common = {
        inUse: false,
        itemName: "Helm of Valor",
        itemType: "helmet",
        itemRarity: "common",
        armor: 30,
        additionalSTR: 15,
        additionalDEX: 20,
        additionalSTM: 10,
      };

      const helmet2Common = {
        inUse: false,
        itemName: "Guardian's Visage",
        itemType: "helmet",
        itemRarity: "common",
        armor: 25,
        additionalSTR: 10,
        additionalDEX: 30,
        additionalSTM: 20,
      };

      const helmet3Common = {
        inUse: false,
        itemName: "Steel Coif",
        itemType: "helmet",
        itemRarity: "common",
        armor: 35,
        additionalSTR: 20,
        additionalDEX: 15,
        additionalSTM: 10,
      };

      const helmet4Common = {
        inUse: false,
        itemName: "Silver Crown",
        itemType: "helmet",
        itemRarity: "common",
        armor: 40,
        additionalSTR: 20,
        additionalDEX: 25,
        additionalSTM: 15,
      };

      const helmet5Common = {
        inUse: false,
        itemName: "Hood of Shadows",
        itemType: "helmet",
        itemRarity: "common",
        armor: 30,
        additionalSTR: 10,
        additionalDEX: 35,
        additionalSTM: 25,
      };

      const helmet6Common = {
        inUse: false,
        itemName: "Plated Helm",
        itemType: "helmet",
        itemRarity: "common",
        armor: 25,
        additionalSTR: 15,
        additionalDEX: 10,
        additionalSTM: 20,
      };

      const helmet7Common = {
        inUse: false,
        itemName: "Crest of Protection",
        itemType: "helmet",
        itemRarity: "common",
        armor: 40,
        additionalSTR: 20,
        additionalDEX: 30,
        additionalSTM: 15,
      };

      const helmet8Common = {
        inUse: false,
        itemName: "Leather Hood",
        itemType: "helmet",
        itemRarity: "common",
        armor: 20,
        additionalSTR: 10,
        additionalDEX: 25,
        additionalSTM: 10,
      };

      const helmet9Common = {
        inUse: false,
        itemName: "Mystic Crown",
        itemType: "helmet",
        itemRarity: "common",
        armor: 30,
        additionalSTR: 15,
        additionalDEX: 20,
        additionalSTM: 15,
      };

      const helmet10Common = {
        inUse: false,
        itemName: "Visor of Agility",
        itemType: "helmet",
        itemRarity: "common",
        armor: 35,
        additionalSTR: 15,
        additionalDEX: 30,
        additionalSTM: 10,
      };

      const weapon1Rare = {
        inUse: false,
        itemName: "Blade of Thunder",
        itemType: "weapon",
        itemRarity: "rare",
        armor: 0,
        additionalSTR: 95,
        additionalDEX: 85,
        additionalSTM: 55,
      };

      const weapon2Rare = {
        inUse: false,
        itemName: "Soulreaper",
        itemType: "weapon",
        itemRarity: "rare",
        armor: 0,
        additionalSTR: 105,
        additionalDEX: 95,
        additionalSTM: 50,
      };

      const weapon3Rare = {
        inUse: false,
        itemName: "Whisperwind Bow",
        itemType: "weapon",
        itemRarity: "rare",
        armor: 0,
        additionalSTR: 85,
        additionalDEX: 115,
        additionalSTM: 45,
      };

      const weapon4Rare = {
        inUse: false,
        itemName: "Doombringer Axe",
        itemType: "weapon",
        itemRarity: "rare",
        armor: 0,
        additionalSTR: 110,
        additionalDEX: 75,
        additionalSTM: 60,
      };

      const weapon5Rare = {
        inUse: false,
        itemName: "Serrated Dagger",
        itemType: "weapon",
        itemRarity: "rare",
        armor: 0,
        additionalSTR: 75,
        additionalDEX: 105,
        additionalSTM: 40,
      };

      const weapon6Rare = {
        inUse: false,
        itemName: "Skullcrusher Mace",
        itemType: "weapon",
        itemRarity: "rare",
        armor: 0,
        additionalSTR: 100,
        additionalDEX: 80,
        additionalSTM: 50,
      };

      const weapon7Rare = {
        inUse: false,
        itemName: "Widowmaker Crossbow",
        itemType: "weapon",
        itemRarity: "rare",
        armor: 0,
        additionalSTR: 90,
        additionalDEX: 110,
        additionalSTM: 55,
      };

      const weapon8Rare = {
        inUse: false,
        itemName: "Stormstrike Staff",
        itemType: "weapon",
        itemRarity: "rare",
        armor: 0,
        additionalSTR: 95,
        additionalDEX: 100,
        additionalSTM: 45,
      };

      const weapon9Rare = {
        inUse: false,
        itemName: "Viper's Fang",
        itemType: "weapon",
        itemRarity: "rare",
        armor: 0,
        additionalSTR: 100,
        additionalDEX: 95,
        additionalSTM: 50,
      };

      const weapon10Rare = {
        inUse: false,
        itemName: "Ethereal Blade",
        itemType: "weapon",
        itemRarity: "rare",
        armor: 0,
        additionalSTR: 110,
        additionalDEX: 90,
        additionalSTM: 60,
      };

      const chestplate1Rare = {
        inUse: false,
        itemName: "Radiant Chestplate",
        itemType: "chestplate",
        itemRarity: "rare",
        armor: 95,
        additionalSTR: 55,
        additionalDEX: 60,
        additionalSTM: 35,
      };

      const chestplate2Rare = {
        inUse: false,
        itemName: "Crimson Battleplate",
        itemType: "chestplate",
        itemRarity: "rare",
        armor: 100,
        additionalSTR: 45,
        additionalDEX: 70,
        additionalSTM: 40,
      };

      const chestplate3Rare = {
        inUse: false,
        itemName: "Shimmering Scalemail",
        itemType: "chestplate",
        itemRarity: "rare",
        armor: 80,
        additionalSTR: 50,
        additionalDEX: 45,
        additionalSTM: 30,
      };

      const chestplate4Rare = {
        inUse: false,
        itemName: "Titanic Chestguard",
        itemType: "chestplate",
        itemRarity: "rare",
        armor: 115,
        additionalSTR: 60,
        additionalDEX: 75,
        additionalSTM: 45,
      };

      const chestplate5Rare = {
        inUse: false,
        itemName: "Serpentbane Vest",
        itemType: "chestplate",
        itemRarity: "rare",
        armor: 90,
        additionalSTR: 40,
        additionalDEX: 50,
        additionalSTM: 35,
      };

      const chestplate6Rare = {
        inUse: false,
        itemName: "Ironbark Plate",
        itemType: "chestplate",
        itemRarity: "rare",
        armor: 105,
        additionalSTR: 70,
        additionalDEX: 80,
        additionalSTM: 50,
      };

      const chestplate7Rare = {
        inUse: false,
        itemName: "Azure Breastplate",
        itemType: "chestplate",
        itemRarity: "rare",
        armor: 85,
        additionalSTR: 45,
        additionalDEX: 60,
        additionalSTM: 30,
      };

      const chestplate8Rare = {
        inUse: false,
        itemName: "Dreadforge Armor",
        itemType: "chestplate",
        itemRarity: "rare",
        armor: 120,
        additionalSTR: 80,
        additionalDEX: 70,
        additionalSTM: 50,
      };

      const chestplate9Rare = {
        inUse: false,
        itemName: "Obsidian Chestpiece",
        itemType: "chestplate",
        itemRarity: "rare",
        armor: 95,
        additionalSTR: 50,
        additionalDEX: 45,
        additionalSTM: 35,
      };

      const chestplate10Rare = {
        inUse: false,
        itemName: "Gilded Platemail",
        itemType: "chestplate",
        itemRarity: "rare",
        armor: 110,
        additionalSTR: 65,
        additionalDEX: 65,
        additionalSTM: 40,
      };

      const helmet1Rare = {
        inUse: false,
        itemName: "Dreadmist Helm",
        itemType: "helmet",
        itemRarity: "rare",
        armor: 60,
        additionalSTR: 50,
        additionalDEX: 75,
        additionalSTM: 45,
      };

      const helmet2Rare = {
        inUse: false,
        itemName: "Whisperwind Cowl",
        itemType: "helmet",
        itemRarity: "rare",
        armor: 55,
        additionalSTR: 40,
        additionalDEX: 70,
        additionalSTM: 50,
      };

      const helmet3Rare = {
        inUse: false,
        itemName: "Soulguard Helmet",
        itemType: "helmet",
        itemRarity: "rare",
        armor: 70,
        additionalSTR: 60,
        additionalDEX: 80,
        additionalSTM: 40,
      };

      const helmet4Rare = {
        inUse: false,
        itemName: "Stormcaller Crown",
        itemType: "helmet",
        itemRarity: "rare",
        armor: 75,
        additionalSTR: 45,
        additionalDEX: 60,
        additionalSTM: 60,
      };

      const helmet5Rare = {
        inUse: false,
        itemName: "Radiant Visage",
        itemType: "helmet",
        itemRarity: "rare",
        armor: 65,
        additionalSTR: 55,
        additionalDEX: 40,
        additionalSTM: 45,
      };

      const helmet6Rare = {
        inUse: false,
        itemName: "Gilded Helm",
        itemType: "helmet",
        itemRarity: "rare",
        armor: 80,
        additionalSTR: 35,
        additionalDEX: 65,
        additionalSTM: 55,
      };

      const helmet7Rare = {
        inUse: false,
        itemName: "Shadowstrike Hood",
        itemType: "helmet",
        itemRarity: "rare",
        armor: 50,
        additionalSTR: 60,
        additionalDEX: 50,
        additionalSTM: 40,
      };

      const helmet8Rare = {
        inUse: false,
        itemName: "Ironbark Coif",
        itemType: "helmet",
        itemRarity: "rare",
        armor: 85,
        additionalSTR: 65,
        additionalDEX: 80,
        additionalSTM: 50,
      };

      const helmet9Rare = {
        inUse: false,
        itemName: "Skullcrusher Helm",
        itemType: "helmet",
        itemRarity: "rare",
        armor: 60,
        additionalSTR: 30,
        additionalDEX: 75,
        additionalSTM: 60,
      };

      const helmet10Rare = {
        inUse: false,
        itemName: "Crimson Crown",
        itemType: "helmet",
        itemRarity: "rare",
        armor: 70,
        additionalSTR: 65,
        additionalDEX: 40,
        additionalSTM: 50,
      };

      const weapon1Legendary = {
        inUse: false,
        itemName: "Excalibur",
        itemType: "weapon",
        itemRarity: "legendary",
        armor: 0,
        additionalSTR: 185,
        additionalDEX: 150,
        additionalSTM: 95,
      };

      const weapon2Legendary = {
        inUse: false,
        itemName: "Mjolnir",
        itemType: "weapon",
        itemRarity: "legendary",
        armor: 0,
        additionalSTR: 175,
        additionalDEX: 190,
        additionalSTM: 100,
      };

      const weapon3Legendary = {
        inUse: false,
        itemName: "Gungnir",
        itemType: "weapon",
        itemRarity: "legendary",
        armor: 0,
        additionalSTR: 195,
        additionalDEX: 165,
        additionalSTM: 110,
      };

      const weapon4Legendary = {
        inUse: false,
        itemName: "Masamune",
        itemType: "weapon",
        itemRarity: "legendary",
        armor: 0,
        additionalSTR: 160,
        additionalDEX: 180,
        additionalSTM: 105,
      };

      const weapon5Legendary = {
        inUse: false,
        itemName: "Durandal",
        itemType: "weapon",
        itemRarity: "legendary",
        armor: 0,
        additionalSTR: 190,
        additionalDEX: 170,
        additionalSTM: 100,
      };

      const weapon6Legendary = {
        inUse: false,
        itemName: "Gram",
        itemType: "weapon",
        itemRarity: "legendary",
        armor: 0,
        additionalSTR: 200,
        additionalDEX: 135,
        additionalSTM: 80,
      };

      const weapon7Legendary = {
        inUse: false,
        itemName: "Caladbolg",
        itemType: "weapon",
        itemRarity: "legendary",
        armor: 0,
        additionalSTR: 155,
        additionalDEX: 195,
        additionalSTM: 90,
      };

      const weapon8Legendary = {
        inUse: false,
        itemName: "Claiomh Solais",
        itemType: "weapon",
        itemRarity: "legendary",
        armor: 0,
        additionalSTR: 175,
        additionalDEX: 150,
        additionalSTM: 95,
      };

      const weapon9Legendary = {
        inUse: false,
        itemName: "Hofud",
        itemType: "weapon",
        itemRarity: "legendary",
        armor: 0,
        additionalSTR: 185,
        additionalDEX: 160,
        additionalSTM: 105,
      };

      const weapon10Legendary = {
        inUse: false,
        itemName: "Joyeuse",
        itemType: "weapon",
        itemRarity: "legendary",
        armor: 0,
        additionalSTR: 170,
        additionalDEX: 175,
        additionalSTM: 90,
      };

      const chestplate1Legendary = {
        inUse: false,
        itemName: "Armor of the Phoenix",
        itemType: "chestplate",
        itemRarity: "legendary",
        armor: 190,
        additionalSTR: 135,
        additionalDEX: 130,
        additionalSTM: 85,
      };

      const chestplate2Legendary = {
        inUse: false,
        itemName: "Dragonscale Plate",
        itemType: "chestplate",
        itemRarity: "legendary",
        armor: 200,
        additionalSTR: 145,
        additionalDEX: 140,
        additionalSTM: 90,
      };

      const chestplate3Legendary = {
        inUse: false,
        itemName: "Titanium Chestguard",
        itemType: "chestplate",
        itemRarity: "legendary",
        armor: 185,
        additionalSTR: 150,
        additionalDEX: 135,
        additionalSTM: 100,
      };

      const chestplate4Legendary = {
        inUse: false,
        itemName: "Sentinel's Embrace",
        itemType: "chestplate",
        itemRarity: "legendary",
        armor: 180,
        additionalSTR: 140,
        additionalDEX: 130,
        additionalSTM: 105,
      };

      const chestplate5Legendary = {
        inUse: false,
        itemName: "Guardian's Plate",
        itemType: "chestplate",
        itemRarity: "legendary",
        armor: 195,
        additionalSTR: 130,
        additionalDEX: 140,
        additionalSTM: 95,
      };

      const chestplate6Legendary = {
        inUse: false,
        itemName: "Celestial Armor",
        itemType: "chestplate",
        itemRarity: "legendary",
        armor: 170,
        additionalSTR: 150,
        additionalDEX: 135,
        additionalSTM: 100,
      };

      const chestplate7Legendary = {
        inUse: false,
        itemName: "Eternal Aegis",
        itemType: "chestplate",
        itemRarity: "legendary",
        armor: 200,
        additionalSTR: 140,
        additionalDEX: 130,
        additionalSTM: 105,
      };

      const chestplate8Legendary = {
        inUse: false,
        itemName: "Dreadplate of the Conqueror",
        itemType: "chestplate",
        itemRarity: "legendary",
        armor: 185,
        additionalSTR: 145,
        additionalDEX: 140,
        additionalSTM: 90,
      };

      const chestplate9Legendary = {
        inUse: false,
        itemName: "Archon's Breastplate",
        itemType: "chestplate",
        itemRarity: "legendary",
        armor: 195,
        additionalSTR: 135,
        additionalDEX: 130,
        additionalSTM: 95,
      };

      const chestplate10Legendary = {
        inUse: false,
        itemName: "Majestic Warplate",
        itemType: "chestplate",
        itemRarity: "legendary",
        armor: 175,
        additionalSTR: 150,
        additionalDEX: 140,
        additionalSTM: 100,
      };

      const helmet1Legendary = {
        inUse: false,
        itemName: "Helm of the Celestial",
        itemType: "helmet",
        itemRarity: "legendary",
        armor: 120,
        additionalSTR: 85,
        additionalDEX: 100,
        additionalSTM: 70,
      };

      const helmet2Legendary = {
        inUse: false,
        itemName: "Crown of the Phoenix",
        itemType: "helmet",
        itemRarity: "legendary",
        armor: 130,
        additionalSTR: 90,
        additionalDEX: 110,
        additionalSTM: 80,
      };

      const helmet3Legendary = {
        inUse: false,
        itemName: "Visage of the Guardian",
        itemType: "helmet",
        itemRarity: "legendary",
        armor: 140,
        additionalSTR: 95,
        additionalDEX: 120,
        additionalSTM: 90,
      };

      const helmet4Legendary = {
        inUse: false,
        itemName: "Mask of the Eternal",
        itemType: "helmet",
        itemRarity: "legendary",
        armor: 150,
        additionalSTR: 100,
        additionalDEX: 130,
        additionalSTM: 100,
      };

      const helmet5Legendary = {
        inUse: false,
        itemName: "Helm of the Titan",
        itemType: "helmet",
        itemRarity: "legendary",
        armor: 110,
        additionalSTR: 70,
        additionalDEX: 85,
        additionalSTM: 70,
      };

      const helmet6Legendary = {
        inUse: false,
        itemName: "Crown of the Archon",
        itemType: "helmet",
        itemRarity: "legendary",
        armor: 125,
        additionalSTR: 80,
        additionalDEX: 100,
        additionalSTM: 80,
      };

      const helmet7Legendary = {
        inUse: false,
        itemName: "Visage of the Seraph",
        itemType: "helmet",
        itemRarity: "legendary",
        armor: 135,
        additionalSTR: 85,
        additionalDEX: 110,
        additionalSTM: 90,
      };

      const helmet8Legendary = {
        inUse: false,
        itemName: "Mask of the Dreadlord",
        itemType: "helmet",
        itemRarity: "legendary",
        armor: 145,
        additionalSTR: 90,
        additionalDEX: 120,
        additionalSTM: 100,
      };

      const helmet9Legendary = {
        inUse: false,
        itemName: "Helm of the Warlord",
        itemType: "helmet",
        itemRarity: "legendary",
        armor: 115,
        additionalSTR: 75,
        additionalDEX: 90,
        additionalSTM: 70,
      };

      const helmet10Legendary = {
        inUse: false,
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
    } catch (error) {
    }
  }
}
