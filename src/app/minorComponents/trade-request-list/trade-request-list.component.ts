import { Component, OnInit } from '@angular/core';
import {TradeService} from "../../services/trade.service";

@Component({
  selector: 'app-trade-request-list',
  templateUrl: './trade-request-list.component.html',
  styleUrls: ['./trade-request-list.component.scss']
})
export class TradeRequestListComponent implements OnInit {
  tradeRequests: any[] = [];

  constructor(private tradeService: TradeService) { }

  ngOnInit(): void {
    this.getMyTradeMessages();
  }

  async acceptTradeRequest(sender: any) {
    try {
      await this.tradeService.acceptTrade(sender);
    } catch (error) {
      console.error('Failed to accept trade:', error);
    }
  }


  rejectTradeRequest(request: any) {
    this.tradeService.rejectTradeRequest(request);
  }

  async getMyTradeMessages() {
    try {
      this.tradeRequests = await this.tradeService.getMytradeMessages();
    } catch (error) {
      console.error('Failed to retrieve trade messages:', error);
    }
  }

}
