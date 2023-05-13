import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";

@Component({
  selector: 'app-items-overview',
  templateUrl: './items-overview.component.html',
  styleUrls: ['./items-overview.component.css']
})
export class ItemsOverviewComponent implements OnInit {

  constructor(public fireService: FireService) { }

  ngOnInit(): void {
  }

  async getAllUsersItems(){
    await this.fireService.getAllUsersItems();
  }

}
