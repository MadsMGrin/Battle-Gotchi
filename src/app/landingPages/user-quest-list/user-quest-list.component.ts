import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {QuestService} from "../../services/quest.service";

@Component({
  selector: 'app-user-quest-list',
  templateUrl: './user-quest-list.component.html',
  styleUrls: ['./user-quest-list.component.scss']
})
export class UserQuestListComponent implements OnInit {
  userData: any;

  constructor(public questService: QuestService, private router: Router) {}

  async ngOnInit() {
    await this.getUserQuests();
  }

  async getUserQuests(){
    try {
      this.userData = await this.questService.getUserQuests();
    } catch (error) {
      console.error('Error retriveing userData:', error)
    }
  }

  async back(){
    await this.router.navigateByUrl("home");
  }

}
