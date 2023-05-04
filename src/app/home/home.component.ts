import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public fireService: FireService) {
    
  }

  ngOnInit(): void {
  }

  async signOut() {
    await this.fireService.signOut();
  }

}
