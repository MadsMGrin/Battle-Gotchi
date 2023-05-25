import { Injectable } from '@angular/core';
import {FireService} from "../fire.service";
import axios from "axios";

@Injectable({
  providedIn: 'root'
})
export class ChatService extends FireService{

  constructor() {
    super();
  }

  async sendChatMessage(userId: string, message: string): Promise<void> {
    try {
      const response = await axios.post(this.baseurl + "chatMessage", {
        userId: userId,
        message: message
      });

      console.log('Chat message sent successfully');
      console.log(response.data);

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
