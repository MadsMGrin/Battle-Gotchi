import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {TradeService} from "../../services/trade.service";
import {BattleService} from "../../services/battle.service";

@Component({
  selector: 'app-online-user-list',
  templateUrl: './online-user-list.component.html',
  styleUrls: ['./online-user-list.component.scss']
})
export class OnlineUserListComponent implements OnInit {
  onlineUsers: any[] = [];
  itemsList: any[] = [];
  item: any;
  selectedItem: any;

  constructor(private userService: UserService, private router: Router, private tradeService: TradeService, private battleService: BattleService) { }

  ngOnInit(): void {
    this.getOnlineUsers();
  }

  async getOnlineUsers() {
    try {
      this.onlineUsers = await this.userService.getOnlineUsers();
    } catch (error) {
      console.error('Error retrieving online users:', error);
    }
  }

  async displayItemsForSelectedUser(userId: string) {
    try {
      const user = this.onlineUsers.find(u => u?.uid === userId);
      if (user) {
        if (user.showItems) {
          user.showItems = false;
        } else {
          this.itemsList = await this.tradeService.getItemsForOnlineUsers(userId);
          user.items = this.itemsList;
          user.showItems = true;
          console.log(this.itemsList + " hereeeeeeeeeeeeeeeeeeeeeeeee");

          // Assign the first item from 'itemsList' to the 'item' property
          this.item = this.itemsList[0];
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async requestBattle(userId: string) {
    try {
      await this.battleService.sendBattleRequest(userId);
      alert('Battle request sent!');
    } catch (error) {
      console.error('Error sending battle request:', error);
    }
  }


  handleItemClick(itemId: any, uid: any) {
    this.router.navigate(['trade-window', itemId, uid]);
  }

}
