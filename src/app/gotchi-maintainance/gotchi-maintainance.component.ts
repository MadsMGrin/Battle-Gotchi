import { Component, OnInit } from '@angular/core';
import { FireService } from "../fire.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
  selector: 'app-gotchi-maintainance',
  templateUrl: './gotchi-maintainance.component.html',
  styleUrls: ['./gotchi-maintainance.component.scss']
})

export class GotchiMaintainanceComponent implements OnInit {

  gotchiData: any;
  onlineUsers: any[] = [];
  battleRequests: any;
  constructor(private fireservice: FireService, private matSnackbar: MatSnackBar, private router: Router) { }

  ngOnInit(): void {
    this.getOnlineUsers();
    this.getGotchi();
    this.getMyBattleRequests();
  }

  async getGotchi() {
    try {
      this.gotchiData = await this.fireservice.getGotchiSpecific();

    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

  async sleep(){
    try {
      await this.fireservice.sendReq("increaseSleep");
      await this.getGotchi();
    }
    catch (error){
      this.matSnackbar.open("Something went wrong")
    }
  }

  async eat(){
    try {
      await this.fireservice.sendReq("increaseHunger");
      await this.getGotchi();
    }
    catch (error){
      this.matSnackbar.open("Something went wrong")
    }
  }

  async shower(){
    try {
      await this.fireservice.sendReq("increaseCleanliness");
      await this.getGotchi();
    }
    catch (error){
      this.matSnackbar.open("Something went wrong")
    }
  }
  goBack() {
    this.router.navigateByUrl("home")
  }


  async signOut() {
    await this.fireservice.signOut();
    this.router.navigateByUrl("login");
  }


  // the battle request so the signed in user.

  async getMyBattleRequests() {
    try {
      const requestList = await this.fireservice.getMyBattleRequests();
      console.log(requestList);
      // Do something with the battle request list
    } catch (error) {
      console.error('Error retrieving battle requests:', error);
    }
  }

  async getOnlineUsers() {
    try {
      this.onlineUsers = await this.fireservice.getOnlineUsers();
    } catch (error) {
      console.error('Error retrieving online users:', error);
    }
  }

  async requestBattle(userId: string) {
    try {
      await this.fireservice.sendBattleRequest(userId);
      alert('Battle request sent!');
    } catch (error) {
      console.error('Error sending battle request:', error);
    }
  }

  async itemsOverview() {
    await this.router.navigateByUrl("itemview");
  }


  rejectBattleRequest(request: any) {

  }

  acceptBattleRequest(request: any) {

  }
}
