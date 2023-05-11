import {Component} from "@angular/core";
import {FireService} from "./fire.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent{

  constructor(public fireService: FireService) {
  }

  checkAuth(): boolean{
    return this.fireService.auth.currentUser==undefined;
  }
}
