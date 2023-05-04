import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";
import {gotchi} from "../../entities/gotchi";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gotchiData: any;


  constructor(public fireService: FireService) {
  }

  ngOnInit(): void {
  }

  async getGotchi(){
    this.gotchiData = await this.fireService.getGotchi();
  }

  async signOut() {
    await this.fireService.signOut();
  }

}
