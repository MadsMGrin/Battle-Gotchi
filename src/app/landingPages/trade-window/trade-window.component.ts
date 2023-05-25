import { Component, OnInit } from '@angular/core';
import { FireService } from "../../fire.service";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";

@Component({
  selector: 'app-trade-window',
  templateUrl: './trade-window.component.html',
  styleUrls: ['./trade-window.component.scss']
})
export class TradeWindowComponent implements OnInit {
  items: any[] = [];
  itemidurl: string = "";
  urlUserId: string = "";
  tradeRequests: any[] = [];
  constructor(private fireservice: FireService, private route: ActivatedRoute) {


  }

  ngOnInit(): void {
    this.getItemsForCurrentUser();
    this.extractItem();

  }

  async getItemsForCurrentUser() {
    try {
      const response = await this.fireservice.getMyGotchiItems();
      if (Array.isArray(response)) {
        this.items = response;
      } else {
        console.error('Invalid response format. Expected an array.');
      }
    } catch (error) {
      console.error('Failed to retrieve items:', error);
    }
  }

  extractItem(){
    const pathname = window.location.pathname;

    // Remove leading and trailing slashes (if any)
    const trimmedPathname = pathname.replace(/^\/|\/$/g, '');

    // Split the pathname into parts
    const parts = trimmedPathname.split('/');

    // Extract itemid and userid
    this.itemidurl = parts[1];
    this.urlUserId = parts[2];

    console.log("2+sdfsdfsdf"+this.itemidurl); // Output: itemid
    console.log("2+sdfsdfsdf"+this.urlUserId); // Output: userid

  }


  async addToTrade(itemId) {
    const sellItemId = itemId;
    console.log(sellItemId + "compo xxxxxxxxxxxxxx")
    const curentUserId = await this.fireservice.getCurrentUserId();


    try {
      const response = await this.fireservice.sendTradeMessage(curentUserId, sellItemId, this.itemidurl, this.urlUserId);
      console.log(response);
    } catch (error) {
      console.error('Error:', error);
    }
  }


  async getSpecificItemBasedOnId (itemId: string) {
    await this.fireservice.getSpecificItem(itemId);
  }


}
