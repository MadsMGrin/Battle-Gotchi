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
  itemData: any;


  constructor(public fireService: FireService) {
  }

  ngOnInit(): void {
  }

  async getGotchi(){
    this.gotchiData = await this.fireService.getGotchi();
  }

  async signOut() {
    await this.fireService.signOut();
  }

  async itemsOverview() {
    this.itemData = await this.fireService.getAllUsersItems();

  }

  async createItem() {
    await this.fireService.createItem();
  }
}
