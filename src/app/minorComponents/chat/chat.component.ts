import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FireService} from "../../fire.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  chatMessages: any[] =[];
  newMessage: any;
  @ViewChild('chatContainer', { static: true })
  private chatContainer!: ElementRef;

  constructor(private fireservice: FireService) { }

  ngOnInit(): void {
    this.fetchChatMessages();
  }


  async fetchChatMessages(): Promise<void> {
    try {
      const messages: { message: string; username: string }[] = await this.fireservice.fetchChatMessages();
      this.chatMessages = messages;
      // Scroll to the bottom of the chat container
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    } catch (error) {
      console.log('Error fetching chat messages:', error);
    }
  }

  scrollToBottom(): void {
    const container = document.querySelector('.chatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

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
}
