import { Component, OnInit } from '@angular/core';
import {FireService} from "../../fire.service";

@Component({
  selector: 'app-battle-request-list',
  templateUrl: './battle-request-list.component.html',
  styleUrls: ['./battle-request-list.component.scss']
})
export class BattleRequestListComponent implements OnInit {
  battleRequests: any[] = [];

  constructor(private fireservice: FireService) { }

  ngOnInit(): void {
    this.getMyBattleRequests();
  }

  async acceptBattleRequest(request: any): Promise<void> {
    try {
      // Accept the battle request and delete it from the Firestore 'battleRequests' collection
      await this.fireservice.getDocId(request);
      // Get the current user id
      const currentUserId = this.fireservice.getCurrentUserId();
      await this.fireservice.increaseQuestProgress(1, "battle");
      console.log(currentUserId)
      // Simulate the battle and get the result
      await this.fireservice.simulateBattle(currentUserId, request);

    } catch (error) {
      throw error;
    }
  }

  async rejectBattleRequest(request: any) {
    try {
      await this.fireservice.rejectBattleRequest(request);
      console.log('Battle request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting battle request:', error);
    }
  }

  async getMyBattleRequests() {
    try {
      this.battleRequests = await this.fireservice.getMyBattleRequests();
    } catch (error) {
      console.error('Error retrieving battle requests:', error);
    }
  }
}
