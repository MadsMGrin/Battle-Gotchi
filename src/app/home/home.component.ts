import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";
import {gotchi} from "../../entities/gotchi";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gotchiData: any;
  onlineUsers: any[] = [];

  constructor(private fireService: FireService) {
  }

  async ngOnInit() {
    this.gotchiData = await this.fireService.getGotchi();
    await this.getOnlineUsers();
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
  async getOnlineUsers() {
    try {
      this.onlineUsers = await this.fireService.getOnlineUsers();
      console.log(this.onlineUsers)
    } catch (error) {
      console.error('Error retrieving online users:', error);
    }
  }

  async requestBattle(userId: string) {
    try {
      await this.fireService.sendBattleRequest(userId);
      alert('Battle request sent!');
    } catch (error) {
      console.error('Error sending battle request:', error);
    }
  }

}
