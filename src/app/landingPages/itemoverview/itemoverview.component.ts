import { Component, OnInit } from '@angular/core';
import {FireService} from "../../fire.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-itemoerview',
  templateUrl: './itemoverview.component.html',
  styleUrls: ['./itemoverview.component.css']
})
export class ItemoverviewComponent implements OnInit {
  items: any[] = [];
  currentItem: any[] = [];

  constructor(public fireService: FireService, private router: Router) { }

  async ngOnInit() {
    await this.getAllItems();
  }

  async getAllItems() {
    try {
      this.items = await this.fireService.getAllItems();
    } catch (error) {
      console.error('Error retrieving items:', error);
    }
  }

  async equipItem(type, itemName) {
    this.currentItem = await this.fireService.getEquippedItem(type);
    if(this.currentItem[0]) {
      await this.fireService.removeStats(this.currentItem[0].itemName)
      await this.fireService.unequip(this.currentItem[0].itemName, this.currentItem[0].itemType);
    }

    await this.fireService.equip(itemName, type);
    await this.fireService.addStats(itemName)
    await this.getAllItems();
  }


  async getAllItemsOfType(type) {
    try {
      this.items = await this.fireService.getAllItemsOfType(type);
    } catch (error) {
      console.error('Error retrieving items:', error);
    }
  }

  goBack() {
    this.router.navigateByUrl("home")
  }
}