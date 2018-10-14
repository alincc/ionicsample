import {Injectable} from "@angular/core";
import {PidgeApiService} from "./pidge-api-service";
import {Subject} from "rxjs/Subject";
import {UserMetaInfoInterface, UserMetaInfoService} from "./user-meta-info-service";
import {Chat, ChatMessage, ChatMessageInterface, ChatUserInterface, TeamInterface} from "../../models/chat";
import {ChatParticipantSummary} from "../../models/chat-participant-summary";
import {AuthService} from "./auth-service";
import {Standardize} from "./standardize";
import {UserInterface} from "../../models/user";
import {PagedLoaderInterface} from "../../shared/paged-loader";
import {config} from "../config/config";
import {pidgeApiUrl} from "./pidge-url";
import {Subscription} from "rxjs/Subscription";
import { UpcomingEventInterface } from "../../models/event";

const CHATS_BASE_URL: string = "chats/";
const CREATE_CHAT_URL: string = "affiliates";
const CHAT_INFO_URL: string = CHATS_BASE_URL + "{chat}";
const EDIT_CHAT_URL: string = 'affiliates/{affiliate}';
const UPDATE_CHAT_PHOTO: string = 'affiliates/{affiliate}/photo';
const LEAVE_CHAT_URL: string = CHAT_INFO_URL;
const SEND_CHAT_MESSAGE_URL: string = CHAT_INFO_URL + "/messages";
const LOAD_CHAT_newMessages_URL: string = SEND_CHAT_MESSAGE_URL;
const LOAD_CHAT_MESSAGES_URL: string = CHAT_INFO_URL + "/messages/old/{to_id}/[from_id]";
const UPDATE_MESSAGE_URL: string = CHAT_INFO_URL + "/messages/{message}";

const ADD_USER_TO_CHAT_URL: string = CHATS_BASE_URL + "{chat}/user";
const INVITE_EMAIL_TO_CHAT_URL: string = "affiliates/{affiliate}/users/{email}";
const GET_PUPLIC_URLS: string = "affiliates/{affiliate}/public-urls";
const DELETE_PUBLIC_URLS: string = "affiliates/{affiliate}/public-urls/{urluqid}"
const GET_PUBLIC_URL_INFO: string = "affiliates/public-urls/{urlKey}"
const JOIN_TEAM_WITH_URL: string = "affiliates/{affiliate}/public-urls/{urluqid}/join"
const GET_PENDING_INVITED_MEMBERS:string="affiliates/{affiliate_uqid}/invitations/unregistered"
const DELETE_INVITED_MEMBERS:string="affiliates/{affiliate}/invitations/{email_address}"
const RESEND_TO_INVITED_MEMBER:string="affiliates/{affiliate}/invitations/{email_address}"
//const INVITE_USER_TO_CHAT_URL: string = "affiliates/{affiliate}/users/{user}"; //not use, invite email will be used instead
const UPDATE_CHAT_USER_URL: string = ADD_USER_TO_CHAT_URL + "/{user}";
const TEAM_USERS_URL: string = "affiliates/{affiliate}/users";
const TEAM_USER_URL: string = TEAM_USERS_URL + "/{user}";

//@TODO:clean the URLs above

@Injectable()
export class ChatService {

  protected observableInstance: Subject<Chat[]>;

  protected chats: Chat[] = [];
  protected chatsSummary: ChatParticipantSummary[];
  protected loaded: boolean = false;

  public constructor(protected apis: PidgeApiService,
                     protected auth: AuthService,
                     protected userMeta: UserMetaInfoService) {

    this.observableInstance = new Subject();

    this.auth.subscribe(data => {
      if (!data.loggedIn) {
        this.chats = [];
        this.triggerNext([]);
      }
    });

    this.userMeta.subscribe((data: UserMetaInfoInterface) => {
      this.metaInfoFetched(data);
    });
    this.metaInfoFetched(this.userMeta.info());
  }

  protected metaInfoFetched(data?: UserMetaInfoInterface) {
    if (!data || !data.successLoads) {
      return;
    }
    this.chats = Standardize.chatsList(data.chats.map(chat => {
      chat.summary = chat['summary'][0];
      return chat;
    }));
    // this.chatsSummary = Standardize.chatParticipantSummaryList(data.chatsSummary);
    // this.chatsSummary.forEach((summary: ChatParticipantSummary) => {
    //   this.chats.find(chat => chat.id === summary.chatId).summary = summary;
    // });
    this.loaded = true;
    this.triggerNext(this.chats);
  }

  protected triggerNext(chats) {
    this.observableInstance.next(chats);
  }

  public observable() {
    return this.observableInstance;
  }

  public subscribe(callable) {
    return this.observableInstance.subscribe(callable);
  }

  public getChats(): Chat[] {
    return this.chats;
  }

  public onlyOnce(): Promise<Chat[]> {
    let subscription: Subscription;
    return new Promise((resolve, reject) => {
      if (this.loaded) {
        return resolve(this.chats);
      }
      subscription = this.subscribe(chats => chats ? (subscription && subscription.unsubscribe()) || resolve(chats) : null);
    });
  }

  public chatMessagesLoader(chat: TeamInterface): ChatMessagesLoader {
    return new ChatMessagesLoader(chat, this);
  }

  public loadMessages(chat: TeamInterface, toMessageId?: number, fromMessageId?: number, loadMore: boolean = false): Promise<ChatMessageInterface[]> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(LOAD_CHAT_MESSAGES_URL, {
        chat: chat.uqid,
        to_id: toMessageId || 'any',
        from_id: fromMessageId || '',
        load_more: loadMore ? '1' : '0',
        // size: config.CHAT_PAGE_SIZE, //comment to let the server control it
        uxtm: new Date().getTime()
      });
      this.apis.get(this.auth.currentUser, url, {})
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }

  public loadNewMessages(chat: TeamInterface, afterTs?: any): Promise<ChatMessageInterface[]> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(LOAD_CHAT_newMessages_URL, {
        chat: chat.uqid,
        from: afterTs,
        uxtm: new Date().getTime()
      });
      this.apis.get(this.auth.currentUser, url, {})
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }

  public createNewChat(parameters: TeamInterface): Promise<TeamInterface> {
    let {title, description, sport, startAt, endAt, image, type} = parameters;
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(CREATE_CHAT_URL, {}, null, true);
      this.apis.post(this.auth.currentUser, url, {
        title,
        description,
        sport,
        image,
        type,
        startAt: startAt ? startAt.toISOString() : null,
        endAt: endAt ? endAt.toISOString() : null
      }, {})
        .then(chat => resolve(Standardize.chat(chat)))
        .catch(error => reject(error));
    });
  }

  public sendNewMessage(chat: TeamInterface, message: string): Promise<ChatMessageInterface> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(SEND_CHAT_MESSAGE_URL, {chat: chat.uqid});
      this.apis.post(this.auth.currentUser, url, {message: message}, {})
        .then(message => resolve(new ChatMessage(message)))
        .catch(error => reject(error));
    });
  }

  public chatInfo(uqid: string): Promise<Chat> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(CHAT_INFO_URL, {chat: uqid, uxtm: new Date().getTime()});
      this.apis.get(this.auth.currentUser, url, {})
        .then(chat => resolve(Standardize.chat(chat)))
        .catch(error => reject(error));
    });

  }

  public getPublicUrls(team: TeamInterface): Promise<PuplicUrl[]> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(GET_PUPLIC_URLS, {affiliate: team.uqid}, null, true);
      this.apis.get(this.auth.currentUser, url, {})
        .then(urls => resolve(urls))
        .catch(error => reject(error));
    });

  }

  public getPublicUrlInfo(urlKey: string): Promise<PuplicUrl> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(GET_PUBLIC_URL_INFO, {urlKey: urlKey}, null, true);
      this.apis.publicGet(url, {})
        .then(urls => resolve(urls))
        .catch(error => reject(error));
    });

  }
  public getPendingMembers(team: TeamInterface): Promise<memberInterface[]> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl( GET_PENDING_INVITED_MEMBERS, {affiliate_uqid: team.uqid}, null, true);
      this.apis.get(this.auth.currentUser, url, {})
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
  }
  public deleteInvitedMembers(team:TeamInterface,member: memberInterface): Promise<memberInterface> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl( DELETE_INVITED_MEMBERS, {affiliate: team.uqid,email_address:member.email_address}, null, true);
      this.apis.delete(this.auth.currentUser, url, {})
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
  }
  public resendToInvitedMembers(team:TeamInterface,member: memberInterface): Promise<memberInterface> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl( RESEND_TO_INVITED_MEMBER, {affiliate: team.uqid,email_address:member.email_address}, null, true);
      this.apis.put(this.auth.currentUser, url, {})
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
  }
  public createPublicUrls(team: TeamInterface): Promise<PuplicUrl> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(GET_PUPLIC_URLS, {affiliate: team.uqid}, null, true);
      this.apis.post(this.auth.currentUser, url, {}, {})
        .then(url => resolve(url))
        .catch(error => reject(error));
    });

  }

  public deletePublicUrls(team: TeamInterface, publicUrlObject: PuplicUrl): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(DELETE_PUBLIC_URLS, {affiliate: team.uqid, urluqid: publicUrlObject.url}, null, true);
      this.apis.delete(this.auth.currentUser, url, {})
        .then(result => resolve(result))
        .catch(error => reject(error));
    });

  }

  public joinTeamWithUrl(team: TeamInterface, publicUrlObject: PuplicUrl,event:UpcomingEventInterface): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(JOIN_TEAM_WITH_URL, {affiliate: team.uqid, urluqid: publicUrlObject.url}, null, true);
      if(event==undefined)
      {
      this.apis.post(this.auth.currentUser, url, {})
        .then(result => resolve(result))
        .catch(error => reject(error));
      }
      else
      {
        this.apis.post(this.auth.currentUser, url, {event:event.id})
        .then(result => resolve(result))
        .catch(error => reject(error));
      }
    });

  }

  public addUserToChat(chat: TeamInterface, user: UserInterface) {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(TEAM_USER_URL, {affiliate: chat.uqid, user: user.uqid}, '1', true);
      this.apis.post(this.auth.currentUser, url, {}, {})
        .then(done => resolve(done))
        .catch(error => reject(error));
    });
  }

  public updateChatUser(chat: TeamInterface, user: ChatUserInterface, data) {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(UPDATE_CHAT_USER_URL, {chat: chat.uqid, user: user.pivot.id});
      this.apis.put(this.auth.currentUser, url, data, {})
        .then(done => resolve(done))
        .catch(error => reject(error));
    });
  }

  public removeUserFromChat(chat: TeamInterface, user: ChatUserInterface) {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(TEAM_USER_URL, {affiliate: chat.uqid, user: user.uqid}, '1', true);
      this.apis.delete(this.auth.currentUser, url, {})
        .then(done => resolve(done))
        .catch(error => reject(error));
    });
  }

  public leaveChat(chat: TeamInterface) {
    let cUser;
    return this.auth.getCurrentUser()
      .then(user => cUser = user)
      .then(() => this.apis.delete(this.auth.currentUser, pidgeApiUrl(TEAM_USER_URL, {
        affiliate: chat.uqid,
        user: cUser.uqid
      }, '1', true), {}));
  }

  public refreshChats() {
    return this.userMeta.refresh();
  }

  public updateChat(uqid: string, data: TeamInterface): Promise<TeamInterface> {
    let params = {
      title: data.title,
      description: data.description,
      sport: data.sport,
      startAt: data.startAt ? data.startAt.toISOString() : null,
      endAt: data.endAt ? data.endAt.toISOString() : null,
      image: data.image,
      type: data.type
    };
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(EDIT_CHAT_URL, {affiliate: uqid}, null, true);
      this.apis.put(this.auth.currentUser, url, params, {})
        .then(chat => resolve(Standardize.chat(chat)))
        .catch(error => reject(error));
    });
  }

  public starMessage(chat: TeamInterface, message: ChatMessageInterface, level: number) {
    return this.updateMessage(chat, message, {star_level: level});
  }

  public updateMessage(chat: TeamInterface, message: ChatMessageInterface, data) {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl(UPDATE_MESSAGE_URL, {chat: chat.uqid, message: message.id});
      this.apis.put(this.auth.currentUser, url, data)
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }

  public inviteEmailToChat(chat: TeamInterface, email: string, parameters?: Object): Promise<{ found: boolean, message: string, [key: string]: any }> {
    return this.apis.post(this.auth.currentUser, pidgeApiUrl(INVITE_EMAIL_TO_CHAT_URL, {
      email,
      affiliate: chat.uqid
    }, null, true), parameters || {});
  }

  public changePhoto(team: Chat, image: never | string): Promise<Chat> {
    return this.apis.put(this.auth.currentUser, pidgeApiUrl(UPDATE_CHAT_PHOTO, {affiliate: team.uqid}, "1", true), {image})
      .then(teamInt => team.image = teamInt.image)
      .then(() => team);
  }
}

export class ChatMessagesLoader implements PagedLoaderInterface<ChatMessageInterface> {

  protected messages: ChatMessageInterface[] = [];
  protected currentMessages: ChatMessageInterface[] = [];
  protected lastLoadedMessage: ChatMessageInterface;

  protected observableInstance: Subject<ChatMessagesRefreshDataStampInterface>;

  protected static loadingHandler;

  constructor(protected chat: TeamInterface, protected chatService: ChatService) {
    this.observableInstance = new Subject();
    this.clearLoadingHandler();
    ChatMessagesLoader.loadingHandler = setTimeout(() => this.fetchNew(), 100);
  }

  public loadNext(): Promise<ChatMessageInterface[]> {
    return new Promise((resolve, reject) => {
      try {
        this.chatService.loadMessages(this.chat, this.lastLoadedMessage && this.lastLoadedMessage.hasOwnProperty('id') ? this.lastLoadedMessage.id : null)
          .then((messages: ChatMessageInterface[]) => {
            this.messages = messages.concat(Standardize.chatMessagesList(this.messages));
            this.setLastMessage(messages.length ? messages.slice(0, 1) : [this.lastLoadedMessage]);
            this.triggerObservers(true);
            resolve(messages);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  public loadMore(): Promise<ChatMessageInterface[]> {
    return this.loadNext();
  }

  public reload(loadMore: boolean = false): Promise<ChatMessageInterface[]> {
    return new Promise((resolve, reject) => {
      try {
        this.chatService.loadMessages(this.chat, null, this.lastLoadedMessage && this.lastLoadedMessage.hasOwnProperty('id') ? this.lastLoadedMessage.id : null, loadMore)
          .then((messages: ChatMessageInterface[]) => {
            this.messages = Standardize.chatMessagesList(messages);
            this.setLastMessage(messages.length ? messages.slice(0, 1) : [this.lastLoadedMessage]);
            this.triggerObservers(true);
            resolve(messages);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  public fetchNew(): Promise<ChatMessageInterface[]> {
    return new Promise((resolve, reject) => {
      try {
        this.chatService.loadNewMessages(this.chat, this.lastLoadedMessage ? this.lastLoadedMessage.id : '')
          .then((messages: ChatMessageInterface[]) => {
            this.currentMessages = Standardize.chatMessagesList(messages);
            this.messages = this.messages.concat(this.currentMessages);
            this.setLastMessage(messages.slice(-1));
            this.triggerObservers();
            this.setNextLoad();
            resolve(messages);
          }, error => {
            this.setNextLoad();
            reject(error);
          })
          .catch(error => {
            this.setNextLoad();
            reject(error);
          });
      } catch (error) {
        console.error(error);
        this.setNextLoad();
        reject(error);
      }
    });
  }

  public clearLoadingHandler() {
    if (ChatMessagesLoader.loadingHandler) {
      clearTimeout(ChatMessagesLoader.loadingHandler);
    }
  }

  protected triggerObservers(forceTrigger: boolean = false) {
    if (!this.currentMessages.length && !forceTrigger) {
      return;
    }
    this.observable().next({all: this.messages, new: this.currentMessages});
    this.currentMessages = [];
  }

  public observable() {
    return this.observableInstance;
  }

  public subscribe(callable) {
    return this.observableInstance.subscribe(callable);
  }

  private setLastMessage(messages: ChatMessageInterface[]) {
    let lastMessage = messages.length ? messages[0] : null;
    if (lastMessage) {
      if (!this.lastLoadedMessage) {
        this.lastLoadedMessage = lastMessage;
      } else {
        this.lastLoadedMessage = this.lastLoadedMessage.id < lastMessage.id ? this.lastLoadedMessage : lastMessage;
      }
    }
  }

  private setNextLoad() {
    this.clearLoadingHandler();
    ChatMessagesLoader.loadingHandler = setTimeout(() => this.fetchNew(), config.load_messages_refresh_rate);
  }
}

export interface ChatMessagesRefreshDataStampInterface {
  all: ChatMessageInterface[];
  new: ChatMessageInterface[];
}

export interface PuplicUrl {
  created_at: string;
  deleted_at: string;
  expiry_date: string;
  id: number;
  label: string;
  linkable_id: number;
  linkable_type: string;
  updated_at: string;
  uqid: string;
  url: string;
  linkable: {
    created_at: string;
    description: string;
    end_at: string;
    id: number;
    image: string;
    is_active: boolean;
    last_post_at: string;
    owner_user_id: number;
    sport: string;
    start_at: string;
    title: string;
    type: string;
    updated_at: string;
    uqid: string;
    upcoming_regular_events:Array<UpcomingEventInterface>;
    upcoming_single_events:Array<UpcomingEventInterface>;
  };


}
export interface memberInterface {
  "id":number,
  "email_id":number,
  "affiliate_id":number,
  "user_id":number,
  "as_admin":boolean,
  "as_supervisor":boolean,
  "expires_at":string,
  "message":string,
  "data":Array<any>,
  "created_at":string,
  "updated_at":string,
  "email_address":string
}

export interface ChatRefreshDataStampInterface {
  all: TeamInterface[];
  new: TeamInterface[];
}
