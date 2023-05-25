import { Component, OnInit } from '@angular/core';
import {FireService} from "../../fire.service";

@Component({
  selector: 'app-trade-request-list',
  templateUrl: './trade-request-list.component.html',
  styleUrls: ['./trade-request-list.component.scss']
})
export class TradeRequestListComponent implements OnInit {
  tradeRequests: any[] = [];

  constructor(private fireservice: FireService) { }

  ngOnInit(): void {
    this.getMyTradeMessages();
  }

  async acceptTradeRequest(sender: any) {
    try {
      await this.fireservice.acceptTrade(sender);
      console.log('Trade accepted successfully');
    } catch (error) {
      console.error('Failed to accept trade:', error);
    }
  }


  rejectTradeRequest(request: any) {
    this.fireservice.rejectTradeRequest(request);
  }

  async getMyTradeMessages() {
    try {
      this.tradeRequests = await this.fireservice.getMytradeMessages();
      console.log(this.tradeRequests + "heereeeeeeeeeeeeee compo")
    } catch (error) {
      console.error('Failed to retrieve trade messages:', error);
    }
  }

}
