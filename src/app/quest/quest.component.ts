import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {Router} from "@angular/router";

@Component({
  selector: 'app-quest',
  templateUrl: './quest.component.html',
  styleUrls: ['./quest.component.css']
})
export class QuestComponent implements OnInit {

  dailyQuests: any;
  weeklyQuests: any;
  monthlyQuests: any;
  constructor(public fireService: FireService, private router: Router) {
  }

  async ngOnInit() {
    await this.getDailyQuest();
    await this.getWeeklyQuest();
    await this.getMonthlyQuest();
  }

  async getDailyQuest() {
    try {
      this.dailyQuests = await this.fireService.getQuest("daily");
    } catch (error) {
      console.error('Error retrieving daily quests:', error);
    }
  }

  async getWeeklyQuest() {
    try {
      this.weeklyQuests = await this.fireService.getQuest("weekly");
    } catch (error) {
      console.error('Error retrieving weekly quests:', error);
    }
  }

  async getMonthlyQuest() {
    try {
      this.monthlyQuests = await this.fireService.getQuest("monthly");
    } catch (error) {
      console.error('Error retrieving monthly quests:', error);
    }
  }

  async back() {
    await this.router.navigateByUrl("home");
  }

}
