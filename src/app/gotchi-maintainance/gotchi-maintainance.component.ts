import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-gotchi-maintainance',
  templateUrl: './gotchi-maintainance.component.html',
  styleUrls: ['./gotchi-maintainance.component.scss']
})
export class GotchiMaintainanceComponent implements OnInit {

  gotchiData: any;

  constructor(private fireservice: FireService, private matSnackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.gotchiData = this.getGotchi();
  }

  async getGotchi() {
    try {
      this.gotchiData = await this.fireservice.getGotchi();

    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

  async sleep(){
    try {
      await this.fireservice.sendReq("increaseSleep");
    }
    catch (error){
      this.matSnackbar.open("Something went wrong")
    }
  }

  async eat(){
    try {
      await this.fireservice.sendReq("increaseHunger");
    }
    catch (error){
      this.matSnackbar.open("Something went wrong")
    }
  }

  async shower(){
    try {
      await this.fireservice.sendReq("testTransaction");
    }
    catch (error){
      this.matSnackbar.open("Something went wrong")
    }
  }

}
