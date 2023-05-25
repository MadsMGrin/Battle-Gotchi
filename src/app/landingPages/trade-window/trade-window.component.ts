import { Component, OnInit } from '@angular/core';
import {TradeService} from "../../services/trade.service";

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
  constructor(private tradeService: TradeService) {


  }

  ngOnInit(): void {
    this.getItemsForCurrentUser();
    this.extractItem();

  }

  async getItemsForCurrentUser() {
    try {
      const response = await this.tradeService.getMyGotchiItems();
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


  }


  async addToTrade(itemId) {
    const sellItemId = itemId;

    const curentUserId = await this.tradeService.getCurrentUserId();


    try {
      const response = await this.tradeService.sendTradeMessage(curentUserId, sellItemId, this.itemidurl, this.urlUserId);
    } catch (error) {
      console.error('Error:', error);
    }
  }


  async getSpecificItemBasedOnId (itemId: string) {
    await this.tradeService.getSpecificItem(itemId);
  }


}
