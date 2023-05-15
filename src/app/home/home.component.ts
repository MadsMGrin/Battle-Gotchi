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
  quest: any;


  constructor(public fireService: FireService) {
  }

  async ngOnInit() {
   this.getGotchi();
   this.getQuest();
   this.startQuestCountDown();
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

  async getQuest() {
    try {
      this.quest = await this.fireService.getQuest();
    } catch (error) {
      console.error('Error retrieving quest:', error);
    }
  }

  private startQuestCountDown() {
    setInterval(() => {
      if(this.quest && this.quest.duration) {
        this.quest.duration -= 1;
        if(this.quest.duration <= 0) {
          this.quest.completion = true;
        }
      }
    }, 1000);
  }
}
