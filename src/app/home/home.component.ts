import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";
import {gotchi} from "../../entities/gotchi";
import {quest} from "../../entities/quest";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gotchiData: any;
  dailyQuests: any;
  weeklyQuests: any;
  monthlyQuests: any;


  constructor(public fireService: FireService) {
  }

  async ngOnInit() {
   await this.getGotchi();
   await this.getDailyQuest();
   await this.getWeeklyQuest();
   await this.getMonthlyQuest();
  }


  async getGotchi() {
    try {
      this.gotchiData = await this.fireService.getGotchi();
    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

  async signOut() {
    await this.fireService.signOut();
  }

  async getDailyQuest() {
    try {
      this.dailyQuests = await this.fireService.getQuest("daily");
    } catch (error) {
      console.error('Error retrieving daily quest:', error);
    }
  }

  async getWeeklyQuest() {
    try {
      this.weeklyQuests = await this.fireService.getQuest("weekly");
    } catch (error) {
      console.error('Error retrieving weekly quest:', error);
    }
  }

  async getMonthlyQuest() {
    try {
      this.monthlyQuests = await this.fireService.getQuest("monthly");
    } catch (error) {
      console.error('Error retrieving monthly quest:', error);
    }
  }

}
