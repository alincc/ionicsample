import {Component, ViewChild} from '@angular/core';
import {AlertController, App, Content, IonicPage, NavController, NavParams} from 'ionic-angular';
import {Chat, ChatMessage, ChatMessageInterface, GroupedChatMessagesInterface} from "../../models/chat";
import {ChatMessagesLoader, ChatService} from "../../providers/pidge-client/chat-service";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {AuthService} from "../../providers/pidge-client/auth-service";
import {RegularEvent} from "../../models/regular-event";
import {SimpleStacker} from "../../providers/stacker/simple-stacker";
import {User, UserInterface} from "../../models/user";
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {TeamInfoPage} from "../team-info/team-info";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";
import {StandardToast} from "../../providers/services/standard-toast";

@IonicPage({})
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  @ViewChild(Content) content: Content;

  //@TODO: make chat info loading central, interval, and using the id instead of passed objects

  protected chat: Chat;
  protected loaded: boolean = false;
  protected message: ChatMessageInterface = {message: null};
  protected messages: GroupedChatMessagesInterface[] = [];
  protected messagesLoader: ChatMessagesLoader;

  protected autoScroll: boolean = true;

  protected subscription;
  protected currentUser: UserInterface;

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected authService: AuthService,
              protected chatService: ChatService,
              protected toastCtrl: StandardToast,
              protected alertCtrl: AlertController,
              protected app: App,
              protected loadingStacker: LoadingStacker,
              protected busyStacker: SimpleStacker,
              protected analytics: AnalyticsLogger,
              protected standardAlert: StandardResponseAlert) {

    let chat = this.navParams.get('chat');
    let chatId = this.navParams.get('id');

    Promise.resolve(this.loadingStacker.add())
      .then(() => this.authService.retrieveCurrentUser())
      .then(user => this.currentUser = user)
      .then(() => chat ? chat : this.chatService.chatInfo(chatId))
      .then(chat => this.handleLoadedChat(chat))
      .then(() => this.loadingStacker.pop());
  }

  public get busy(): boolean {
    return this.busyStacker.stacked > 0;
  }

  protected handleLoadedChat(chat?) {
    try {
      if (!chat) {
        throw "Passed chat is invalid";
      } else if (chat.hasOwnProperty('you') && chat.hasOwnProperty('events')) {
        //chat is loaded well
        this.chat = chat;
        this.setChatUser();
      }
      if (chat && chat.events && chat.you && chat.events.length && chat.you.id) {
        this.init();
      } else {
        this.loadChatInfo(chat);
      }
    } catch (error) {
      this.fatalError(error);
    }
  }

  protected init() {
    this.app.setTitle(this.chat.title);
    this.initMessagesLoader();
    this.sortEvents();
    this.loaded = true;
  }

  protected initMessagesLoader() {
    if (this.messagesLoader) {
      this.messagesLoader.clearLoadingHandler();
    }
    this.messagesLoader = this.chatService.chatMessagesLoader(this.chat);
    this.subscription = this.messagesLoader.subscribe((messages: { all: ChatMessage[], new: ChatMessage[] }) => {
      this.autoScroll = this.messages.length === 0 ? true : this.autoScroll;
      this.messages = this.groupMessages(messages.all);
      setTimeout(() => this && this.autoScroll && this.scrollToBottom && this.scrollToBottom(), 250);
    });
    this.messagesLoader.reload();
  }

  protected loadChatInfo(chat?: Chat) {
    this.loadingStacker.add();
    return this.chatService.chatInfo(chat ? chat.uqid : this.chat.uqid)
      .then((chat: Chat) => {
        this.loadingStacker.pop();
        this.chat = chat;
        this.setChatUser();
        this.init();
      })
      .catch(error => {
        this.loadingStacker.pop();
        this.fatalError(error);
      });
  }

  protected groupMessages(messages: ChatMessage[]): GroupedChatMessagesInterface[] {
    let list: GroupedChatMessagesInterface[] = [];
    for (let message of messages) {
      if (message.isSystemMessage()) {
        list.push({sender: message.participant, messages: [message], isSystem: true});
      } else if (list.length && list[list.length - 1].sender.id === message.participant.id && !list[list.length - 1].isSystem) {
        list[list.length - 1].messages.push(message);
      } else {
        list.push({sender: message.participant, messages: [message], isSystem: false});
      }
    }
    return list;
  }

  protected messageOptions(event, message: ChatMessage) {
    let buttons = [];
    if (message.starLevel !== 1) {
      buttons.push({
        role: "button",
        text: "Star the message",
        handler: (e) => {
          this.starMessage(message, 1);
        }
      });
    }
    if (message.starLevel !== 2) {
      buttons.push({});
    }
    if (message.starLevel !== 0) {
      buttons.push({
        role: "button",
        text: "Unstar the message",
        handler: (e) => {
          this.starMessage(message, 0);
        }
      });
    }
    this.alertCtrl.create({
      title: "Message Action",
      message: "What do you want to do?",
      buttons: [
        {
          role: "button",
          text: "Star the message",
          handler: (e) => {
            console.log(e);
          }
        }
      ]
    }).present();
  }

  protected sortEvents() {
    this.chat.events = this.chat.events.sort((a: RegularEvent, b: RegularEvent) => {
      let at = a.nextOccurrence ? a.nextOccurrence.getTime() : null;
      let bt = b.nextOccurrence ? b.nextOccurrence.getTime() : null;
      return at === bt ? 0 : (!at || bt > at ? -1 : 1);
    });
  }

  protected starMessage(message: ChatMessage, level: number = 1) {
    this.chatService.starMessage(this.chat, message, level)
      .then((message: ChatMessage) => {
        this.successToast("Message star updated");
        return this.messagesLoader.reload(false);
      })
      .catch(error => {
        this.errorToast(error);
      });
  }

  public sendMessage() {
    let message = this.message.message;
    if (this.busy || !message) {
      return false;
    }
    Promise.resolve(this.busyStacker.add())
      .then(() => this.chatService.sendNewMessage(this.chat, message))
      .then(sentMessage => {
        if (this.messages.length && this.messages[this.messages.length - 1].sender.id === this.chat.you.id) {
          this.messages[this.messages.length - 1].messages.push(sentMessage)
        } else {
          this.messages.push({
            sender: this.chat.you, messages: [sentMessage], isSystem: false
          });
        }
      })
      .then(() => setTimeout(() => this.scrollToBottom(300), 200))
      .then(() => this.message.message = null)
      .catch(error => this.errorToast(error))
      .then(() => this.busyStacker.pop());
  }

  protected ionViewDidLoad() {
    this.content.ionScrollEnd.subscribe(scrolled => {
      if (!scrolled) {
        return;
      }
      let isAtTheBottom = scrolled.scrollTop + scrolled.contentHeight > scrolled.scrollElement.scrollHeight - 50;
      let wasScrollingDown = scrolled.directionY === 'down';
      this.autoScroll = wasScrollingDown && isAtTheBottom;
    });
  }

  protected ionViewDidEnter() {
    this.analytics.ga().then(ga => ga.trackView('Chat Page'));
  }

  protected ionViewWillLeave() {
    this.subscription && this.subscription.unsubscribe();
    this.messagesLoader && this.messagesLoader.clearLoadingHandler();
  }

  public isItMe(messageGroup: GroupedChatMessagesInterface) {
    return messageGroup && messageGroup.sender && messageGroup.sender.user && messageGroup.sender.user.uqid === this.currentUser.uqid;
  }

  private scrollToBottom(duration: number = 300) {
    this && this.content && this.content.scrollToBottom(duration);
  }

  protected successToast(message: string) {
    return this.toastCtrl.showSuccess(message);
  }

  protected errorToast(error: any) {
    return this.toastCtrl.showError(error);
  }

  protected fatalError(error) {
    return this.standardAlert.showError(error)
      .then(() => this.navCtrl.pop());
  }

  public refreshChat(refresher) {
    this.messagesLoader.reload(true).then(() => refresher.complete(), () => refresher.complete()).catch(() => refresher.complete());
  }

  protected alert(message, type: string = "Info") {
    return this.standardAlert.showInfo(message);
  }

  protected setChatUser() {
    if (this.chat && this.chat.you && !this.chat.you.user) {
      let user = this.currentUser instanceof User ? this.currentUser : new User(this.currentUser);
      this.chat.you.user = user as UserInterface;
    }
  }

  protected showTeamInfo() {
    return this.navCtrl.push(TeamInfoPage, {
      uqid: this.chat.uqid,
      then: team => this.loadChatInfo(this.chat)
    });
  }

}
