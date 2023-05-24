import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { FireService } from "../fire.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
  selector: 'app-gotchi-maintainance',
  templateUrl: './gotchi-maintainance.component.html',
  styleUrls: ['./gotchi-maintainance.component.scss']
})

export class GotchiMaintainanceComponent implements OnInit {
  // a refresh to the chat container.
  @ViewChild('chatContainer', { static: true })
  private chatContainer!: ElementRef;
  gotchiData: any;
  onlineUsers: any[] = [];
  battleRequests: any[] = [];
  newMessage: any;
  chatMessages: any[] =[];
  itemsList: any[] = [];
  selectedItem: any;

  constructor(private fireservice: FireService, private matSnackbar: MatSnackBar, private router: Router) {
  }

  ngOnInit(): void {
    this.getOnlineUsers();
    this.getGotchi();
    this.getMyBattleRequests();
    this.fetchChatMessages();
  }

  async getGotchi() {
    try {
      this.gotchiData = await this.fireservice.getGotchiSpecific();

    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

  async sleep() {
    try {
      await this.fireservice.sendReq("increaseSleep");
      await this.getGotchi();
      await this.fireservice.increaseQuestProgress(1, "sleep");
    } catch (error) {
      this.matSnackbar.open("Something went wrong");
    }
  }

  async eat() {
    try {
      await this.fireservice.sendReq("increaseHunger");
      await this.getGotchi();
      await this.fireservice.increaseQuestProgress(1, "eat");
    } catch (error) {
      this.matSnackbar.open("Something went wrong");
    }
  }

  async shower() {
    try {
      await this.fireservice.sendReq("increaseCleanliness");
      await this.getGotchi();
      await this.fireservice.increaseQuestProgress(1, "shower");
    } catch (error) {
      this.matSnackbar.open("Something went wrong");
    }
  }

  goBack() {
    this.router.navigateByUrl("home")
  }

  async signOut() {
    await this.fireservice.signOut();
    this.router.navigateByUrl("login");
  }

  // the battle request so the signed-in user.
  async getMyBattleRequests() {
    try {
      this.battleRequests = await this.fireservice.getMyBattleRequests();
    } catch (error) {
      console.error('Error retrieving battle requests:', error);
    }
  }

  async getOnlineUsers() {
    try {
      this.onlineUsers = await this.fireservice.getOnlineUsers();
    } catch (error) {
      console.error('Error retrieving online users:', error);
    }
  }
  item: any; // Declare the 'item' property

  async displayItemsForSelectedUser(userId: string) {
    try {
      const user = this.onlineUsers.find(u => u?.uid === userId);
      if (user) {
        if (user.showItems) {
          user.showItems = false;
        } else {
          this.itemsList = await this.fireservice.getItemsForOnlineUser(userId);
          user.items = this.itemsList;
          user.showItems = true;
          console.log(this.itemsList + " hereeeeeeeeeeeeeeeeeeeeeeeee");

          // Assign the first item from 'itemsList' to the 'item' property
          this.item = this.itemsList[0];
        }
      }
    } catch (error) {
      console.error(error);
    }
  }





  async requestBattle(userId: string) {
    try {
      await this.fireservice.sendBattleRequest(userId);
      alert('Battle request sent!');
    } catch (error) {
      console.error('Error sending battle request:', error);
    }
  }

  async quest() {
    await this.router.navigateByUrl("quest");
  }
  async rejectBattleRequest(request: any) {
    try {
      await this.fireservice.rejectBattleRequest(request);
      console.log('Battle request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting battle request:', error);
    }
  }

  // In your GotchiMaintainanceComponent:
  async acceptBattleRequest(request: any): Promise<void> {
    try {
      // Accept the battle request and delete it from the Firestore 'battleRequests' collection
      await this.fireservice.getDocId(request);
      // Get the current user id
      const currentUserId = this.fireservice.getCurrentUserId();
      await this.fireservice.increaseQuestProgress(1, "battle");
      console.log(currentUserId)
      // Simulate the battle and get the result
      await this.fireservice.simulateBattle(currentUserId, request);

    } catch (error) {
      throw error;
    }
  }
  // chat methods

  async sendMessage(): Promise<void> {
    const currentUserId = this.fireservice.getCurrentUserId();
    const message = this.newMessage;

    try {
      await this.fireservice.sendChatMessage(currentUserId, message);
      console.log('Message sent successfully');

      // Clear the input field after sending the message
      this.newMessage = '';
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  async fetchChatMessages(): Promise<void> {
    try {
      const messages: { message: string; username: string }[] = await this.fireservice.fetchChatMessages();
      console.log(messages); // Check the contents of the `messages` array
      this.chatMessages = messages;
      // Scroll to the bottom of the chat container
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    } catch (error) {
      console.log('Error fetching chat messages:', error);
    }
  }

  // used so the chat is scrolled down when you refresh page.

  scrollToBottom(): void {
    const container = document.querySelector('.chatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  itemsOverview() {
    this.router.navigateByUrl("itemview")
  }


  handleItemClick(itemId: any, uid: any) {
    console.log("iteeeeeeeeeeeeeem"+itemId)
    console.log(uid)
    this.router.navigate(['trade-window', itemId, uid]);
  }
}

