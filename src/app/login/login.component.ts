import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = "";
  password: string = "";

  constructor(public fireService: FireService) { }

  ngOnInit(): void {
  }

  async register(email: string, password: string){
    await this.fireService.register(email, password).then(res => this.fireService.createGotchi())
  }

  async signIn(email: string, password: string){
    await this.fireService.signIn(email, password);
  }

}
