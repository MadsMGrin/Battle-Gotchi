import { Component, OnInit } from '@angular/core';
import { FireService } from "../fire.service";

@Component({
  selector: 'app-trade-window',
  templateUrl: './trade-window.component.html',
  styleUrls: ['./trade-window.component.scss']
})
export class TradeWindowComponent implements OnInit {
  items: any[] = [];

  constructor(private fireservice: FireService) { }

  ngOnInit(): void {
    this.getItemsForCurrentUser();
  }

  async getItemsForCurrentUser() {
    try {
      const response = await this.fireservice.getMyGotchiItems();
      if (Array.isArray(response)) {
        this.items = response;
        console.log(response + "item hereeeeeeeeeeee")
      } else {
        console.error('Invalid response format. Expected an array.');
      }
    } catch (error) {
      console.error('Failed to retrieve items:', error);
    }
  }


  addToTrade(item: any) {
    
  }
}
