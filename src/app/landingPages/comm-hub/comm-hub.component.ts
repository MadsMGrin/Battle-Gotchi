import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-comm-hub',
  templateUrl: './comm-hub.component.html',
  styleUrls: ['./comm-hub.component.scss']
})
export class CommHubComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goBack() {
    this.router.navigateByUrl("home")
  }
}
