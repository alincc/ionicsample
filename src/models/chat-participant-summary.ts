import BaseModel from "./base";
import {Chat, TeamInterface, ChatParticipant, ChatParticipantInterface} from "./chat";
import {User, UserInterface} from "./user";
import {Standardize} from "../providers/pidge-client/standardize";

export interface ChatParticipantSummaryInterface {
  chatId: number;
  chatParticipantId: number;
  hasNewMessages: boolean;
  lastCheckAt: Date;
  lastMessageAt: Date;
  newMessages: number;
  userId: number;
  chat?: TeamInterface;
  user?: UserInterface;
  chatParticipant?: ChatParticipantInterface;
}

export class ChatParticipantSummary extends BaseModel implements ChatParticipantSummaryInterface {

  chatId: number;
  chatParticipantId: number;
  hasNewMessages: boolean;
  lastCheckAt: Date;
  lastMessageAt: Date;
  newMessages: number;
  userId: number;
  chat?: Chat;
  user?: UserInterface;
  chatParticipant?: ChatParticipant;

  protected get dateKeys(): string[] {
    return ["lastMessageAt", "lastCheckAt"];
  }

  protected get rawKeysMapping(): { [p: string]: string } {
    return {
      "last_check_at": "lastCheckAt",
      "last_message_at": "lastMessageAt",
      "user_id": "userId",
      "chat_id": "chatId",
      "chat_participant_id": "chatParticipantId",
      "has_new_messages": "hasNewMessages",
      "new_messages": "newMessages",
      "chat_participant": "chatParticipant"
    };
  }

  constructor(loaded: ChatParticipantSummaryInterface) {
    super(loaded);
    this.chat = this.chat ? (this.chat instanceof Chat ? this.chat : Standardize.chat(this.chat)) : null;
    this.user = this.user ? (this.user instanceof User ? this.user : Standardize.user(this.user)) : null;
    this.chatParticipant = this.chatParticipant ? (this.chatParticipant instanceof ChatParticipant ? this.chatParticipant : new ChatParticipant(this.chatParticipant)) : null;
  }

}
