import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";
import {gotchi} from "../../entities/gotchi";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gotchiData: any;



  constructor(public fireService: FireService, private router: Router) {
  }

  async ngOnInit() {
    this.gotchiData = await this.fireService.getGotchi();
  }

  async getGotchi() {
    try {
      this.gotchiData = await this.fireService.getGotchi();

    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

  async signOut() {
    await this.fireService.signOut();
  }

  async itemsOverview() {
await this.router.navigateByUrl("itemview");
  }
}
