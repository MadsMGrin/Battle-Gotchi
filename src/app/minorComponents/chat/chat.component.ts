import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ChatService} from "../../services/chat.service";

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

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.fetchChatMessages();
  }


  async fetchChatMessages(): Promise<void> {
    try {
      const messages: { message: string; username: string }[] = await this.chatService.fetchChatMessages();
      this.chatMessages = messages;
      // Scroll to the bottom of the chat container
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    } catch (error) {
    }
  }

  scrollToBottom(): void {
    const container = document.querySelector('.chatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  async sendMessage(): Promise<void> {
    const currentUserId = this.chatService.getCurrentUserId();
    const message = this.newMessage;
    try {
      await this.chatService.sendChatMessage(currentUserId, message);
      // Clear the input field after sending the message
      this.newMessage = '';
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }
}
