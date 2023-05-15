import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";

@Component({
  selector: 'app-gotchi-maintainance',
  templateUrl: './gotchi-maintainance.component.html',
  styleUrls: ['./gotchi-maintainance.component.scss']
})
export class GotchiMaintainanceComponent implements OnInit {

  gotchiData: any;

  constructor(private fireservice: FireService) { }

  ngOnInit(): void {
    this.gotchiData = this.getGotchi();
  }

  async getGotchi() {
    try {
      this.gotchiData = await this.fireservice.getGotchi();

    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

}
