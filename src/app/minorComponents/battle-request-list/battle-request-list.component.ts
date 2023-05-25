import { Component, OnInit } from '@angular/core';
import {BattleService} from "../../services/battle.service";
import {QuestService} from "../../services/quest.service";
import {BaseService} from "../../services/baseService";

@Component({
  selector: 'app-battle-request-list',
  templateUrl: './battle-request-list.component.html',
  styleUrls: ['./battle-request-list.component.scss']
})
export class BattleRequestListComponent implements OnInit {
  battleRequests: any[] = [];

  constructor(private battleService: BattleService, private questService: QuestService, private baseSerive: BaseService) { }

  ngOnInit(): void {
    this.getMyBattleRequests();
  }

  async acceptBattleRequest(request: any): Promise<void> {
    try {
      await this.battleService.getDocId(request);
      const currentUserId = this.baseSerive.getCurrentUserId();
      await this.questService.increaseQuestProgress(1, "battle");
      await this.battleService.simulateBattle(currentUserId, request);
    } catch (error) {
      throw error;
    }
  }

  async rejectBattleRequest(request: any) {
    try {
      await this.battleService.rejectBattleRequest(request);
    } catch (error) {
      console.error('Error rejecting battle request:', error);
    }
  }

  async getMyBattleRequests() {
    try {
      this.battleRequests = await this.battleService.getMyBattleRequests();
    } catch (error) {
      console.error('Error retrieving battle requests:', error);
    }
  }
}
