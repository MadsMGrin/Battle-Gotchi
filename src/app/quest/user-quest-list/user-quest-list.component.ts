import { Component, OnInit } from '@angular/core';
import {FireService} from "../../fire.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-user-quest-list',
  templateUrl: './user-quest-list.component.html',
  styleUrls: ['./user-quest-list.component.scss']
})
export class UserQuestListComponent implements OnInit {
  userData: any;

  constructor(public fireService: FireService, private router: Router) {}

  async ngOnInit() {
    await this.getUserQuests();
  }

  async getUserQuests(){
    try {
      this.userData = await this.fireService.getUserQuests();
      console.log(this.userData)
    } catch (error) {
      console.error('Error retriveing userData:', error)
    }
  }

  async back(){
    await this.router.navigateByUrl("home");
  }

}
