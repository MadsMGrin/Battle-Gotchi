import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ItemService} from "../../services/item.service";

@Component({
  selector: 'app-itemoerview',
  templateUrl: './itemoverview.component.html',
  styleUrls: ['./itemoverview.component.css']
})
export class ItemoverviewComponent implements OnInit {
  items: any[] = [];
  currentItem: any[] = [];

  constructor(public itemService: ItemService, private router: Router) { }

  async ngOnInit() {
    await this.getAllItems();
  }

  async getAllItems() {
    try {
      this.items = await this.itemService.getAllItems();
    } catch (error) {
      console.error('Error retrieving items:', error);
    }
  }

  async equipItem(type, itemName) {
    this.currentItem = await this.itemService.getEquippedItem(type);
    if(this.currentItem[0]) {
      await this.itemService.removeStats(this.currentItem[0].itemName)
      await this.itemService.unequip(this.currentItem[0].itemName, this.currentItem[0].itemType);
    }

    await this.itemService.equip(itemName, type);
    await this.itemService.addStats(itemName)
    await this.getAllItems();
  }


  async getAllItemsOfType(type) {
    try {
      this.items = await this.itemService.getAllItemsOfType(type);
    } catch (error) {
      console.error('Error retrieving items:', error);
    }
  }

  goBack() {
    this.router.navigateByUrl("home")
  }
}
