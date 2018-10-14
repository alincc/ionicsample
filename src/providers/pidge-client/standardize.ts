import {User, UserInterface} from "../../models/user";
import {Notification, NotificationInterface} from "../../models/notification";
import {
  Chat,
  TeamInterface,
  ChatMessage,
  ChatMessageInterface,
  ChatParticipant,
  ChatParticipantInterface,
  ChatUser,
  ChatUserInterface
} from "../../models/chat";
import {Event, EventInterface} from "../../models/event";
import {EventInvitation, EventInvitationInterface} from "../../models/event-invitation";
import {ChatParticipantSummary, ChatParticipantSummaryInterface} from "../../models/chat-participant-summary";
import {RegularEvent, RegularEventInterface} from "../../models/regular-event";

export class Standardize {

  public static user(loaded: UserInterface): User {
    return loaded instanceof User ? loaded : new User(loaded);
  }

  public static usersList(models: UserInterface[]): User[] {
    let list = [];
    if (!(models && models.length)) {
      return list;
    }
    for (let model of models) {
      list.push(Standardize.user(model));
    }
    return list;
  }

  public static notification(loaded: NotificationInterface, user: UserInterface = null, relatedChat: TeamInterface = null, relatedUser: UserInterface = null, relatedEvent: EventInterface = null, relatedInvitation: EventInvitationInterface = null) {
    if (loaded instanceof Notification) {
      return loaded;
    }
    loaded.user = user || loaded.user || null;
    loaded.relatedUser = relatedUser || loaded.relatedUser || null;
    loaded.relatedChat = relatedChat || loaded.relatedChat || null;
    loaded.relatedEvent = relatedEvent || loaded.relatedEvent || null;
    loaded.relatedInvitation = relatedInvitation || loaded.relatedInvitation || null;
    return new Notification(loaded);
  }

  public static notificationsList(models: NotificationInterface[], user: UserInterface = null, relatedChat: TeamInterface = null, relatedUser: UserInterface = null, relatedEvent: EventInterface = null, relatedInvitation: EventInvitationInterface = null): Notification[] {
    let list = [];
    if (!(models && models.length)) {
      return list;
    }
    for (let model of models) {
      list.push(Standardize.notification(model, user, relatedChat, relatedUser, relatedEvent, relatedInvitation));
    }
    return list;
  }

  public static chat(loaded: TeamInterface): Chat {
    return loaded instanceof Chat ? loaded : new Chat(loaded);
  }

  public static chatsList(models: TeamInterface[]): Chat[] {
    let list = [];
    if (!(models && models.length)) {
      return list;
    }
    for (let model of models) {
      list.push(Standardize.chat(model));
    }
    return list;
  }

  public static chatMessage(loaded: ChatMessageInterface): ChatMessage {
    return loaded instanceof ChatMessage ? loaded : new ChatMessage(loaded);
  }

  public static chatMessagesList(models: ChatMessageInterface[]): ChatMessage[] {
    let list = [];
    if (!(models && models.length)) {
      return list;
    }
    for (let model of models) {
      list.push(Standardize.chatMessage(model));
    }
    return list;
  }

  public static chatUser(loaded: ChatUserInterface): ChatUser {
    return loaded instanceof ChatUser ? loaded : new ChatUser(loaded);
  }

  public static chatUsersList(models: ChatUserInterface[]): ChatUser[] {
    let list = [];
    if (!(models && models.length)) {
      return list;
    }
    for (let model of models) {
      list.push(Standardize.chatUser(model));
    }
    return list;
  }

  public static chatParticipant(loaded: ChatParticipantInterface, user?: User): ChatParticipant {
    if (loaded instanceof ChatParticipant) {
      return loaded;
    }
    loaded.user = user || loaded.user || null;
    return new ChatParticipant(loaded);
  }

  public static chatParticipantsList(models: ChatParticipantInterface[], user?: User): ChatParticipant[] {
    let list = [];
    if (!(models && models.length)) {
      return list;
    }
    for (let model of models) {
      list.push(Standardize.chatParticipant(model, user));
    }
    return list;
  }

  public static chatParticipantSummary(loaded: ChatParticipantSummaryInterface, chat?: Chat, user?: User, chatParticipant?: ChatParticipant): ChatParticipantSummary {
    if (loaded instanceof ChatParticipantSummary) {
      return loaded;
    }
    loaded.chat = chat || loaded.chat || null;
    loaded.user = user || loaded.user || null;
    loaded.chatParticipant = chatParticipant || loaded.chatParticipant || null;
    return new ChatParticipantSummary(loaded);
  }

  public static chatParticipantSummaryList(models: ChatParticipantSummaryInterface[], chat?: Chat, user?: User, chatParticipant?: ChatParticipant): ChatParticipantSummary[] {
    let list = [];
    if (!(models && models.length)) {
      return list;
    }
    for (let model of models) {
      list.push(Standardize.chatParticipantSummary(model, chat, user, chatParticipant));
    }
    return list;
  }

  public static regularEvent(loaded: RegularEventInterface, chat?: Chat): RegularEvent {
    if (loaded instanceof RegularEvent) {
      return loaded;
    }
    loaded.chat = chat || loaded.chat || null;
    return new RegularEvent(loaded);
  }

  public static regularEventsList(models: RegularEventInterface[], chat?: Chat): RegularEvent[] {
    let list = [];
    if (!(models && models.length)) {
      return list;
    }
    for (let model of models) {
      list.push(Standardize.regularEvent(model, chat));
    }
    return list;
  }

  public static event(loaded: EventInterface, chat?: Chat, regularEvent?: RegularEvent): Event {
    if (loaded instanceof Event) {
      return loaded;
    }
    loaded.chat = chat || loaded.chat || null;
    loaded.regularEvent = regularEvent || loaded.regularEvent || null;
    return new Event(loaded);
  }

  public static eventsList(models: EventInterface[], chat?: Chat, regularEvent?: RegularEvent): Event[] {
    let list = [];
    if (!(models && models.length)) {
      return list;
    }
    for (let model of models) {
      list.push(Standardize.event(model, chat, regularEvent));
    }
    return list;
  }

  public static eventInvitation(loaded: EventInvitationInterface, event?: Event): EventInvitation {
    if (loaded instanceof EventInvitation) {
      return loaded;
    }
    loaded.event = event || loaded.event || null;
    return new EventInvitation(loaded);
  }

  public static eventInvitationsList(models: EventInvitationInterface[], event?: Event): EventInvitation[] {
    let list = [];
    if (!(models && models.length)) {
      return list;
    }
    for (let model of models) {
      list.push(Standardize.eventInvitation(model, event));
    }
    return list;
  }

}
