import { Injectable } from '@angular/core';
import {FirebaseInitService} from "../fire.service";
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import axios from "axios";
import {BaseService} from "./baseService";

@Injectable({
  providedIn: 'root'
})
// it needs to extend the base service, it's basically the same class as the base service, but it has its own methods.
export class ChatService extends BaseService{

  constructor(firebaseInitService: FirebaseInitService) {
    super(firebaseInitService);
  }

  async sendChatMessage(userId: string, message: string): Promise<void> {
    try {
      // very not needed to make it const!
      const response = await axios.post(this.baseurl + "chatMessage", {
        userId: userId,
        message: message
      });

    } catch (error) {
      console.error('Error sending chat message:', error);
      throw new Error('Failed to send chat message');
    }
  }
  async fetchChatMessages(): Promise<{ message: string; username: string }[]> {
    try {
      const response = await axios.get<{ message: string; username: string }[]>(this.baseurl + 'chatMessages');
      const chatMessages = response.data;
      return chatMessages;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw new Error('Failed to fetch chat messages');
    }
  }
}
