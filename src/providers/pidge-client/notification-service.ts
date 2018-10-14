import { EventPage } from './../../pages/event/event';
import {Injectable} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {AuthService} from "./auth-service";
import {Standardize} from "./standardize";
import {Group, GroupValueExtractor} from "../../shared/group";
import {Notification} from "../../models/notification";
import {UserMetaInfoInterface, UserMetaInfoService} from "./user-meta-info-service";
import {PidgeApiService} from "./pidge-api-service";
import {pidgeApiUrl} from "./pidge-url";

const NOTIFICATIONS_URL = "user/notifications/";
const DELETE_NOTIFICATION_URL = NOTIFICATIONS_URL + "{id}";
const GET_NOTIFICATION_DETAIL="v1/"+NOTIFICATIONS_URL + "{id}";
@Injectable()
export class NotificationService {

  private _notificationsMap: NotificationSetInterface = {};
  private _notifications: Notification[] = [];
  private _newNotifications: Notification[] = [];
  private _removedNotifications: Notification[] = [];
  private _lastLoadedNotifications: Notification[] = [];
  protected page:string="";
  protected observableInstance: Subject<NotificationsUpdatedResultInterface>;

  constructor(protected userMeta: UserMetaInfoService,
              protected auth: AuthService,
              protected apis: PidgeApiService) {
    this.observableInstance = new Subject();
    this.auth.subscribe(data => {
      if (!data.loggedIn) {
        this._notificationsMap = {};
        this._notifications = [];
        this._newNotifications = [];
        this._removedNotifications = [];
        this._lastLoadedNotifications = [];
        this.triggerNext([], []);
      }
    });
    this.userMeta.subscribe((data: UserMetaInfoInterface) => {
      this.metaInfoFetched(data);
    });
    this.metaInfoFetched(this.userMeta.info());
  }
  
  public notificationRedirectPage(notificationType:string):Promise<string>
  {
   return new Promise((resolve,reject)=>{
     switch (notificationType) {
      case 'EventInvitationAccepted':
      case 'EventInvitationSent':
      case 'EventInvitationConfirmed':
      case 'EventInvitationRejected':
      case 'EventCreated':
      case 'EventInvitationCancelled':
      case 'EventChanged':
       this.page = "EventPage";
        break;
      case 'Chats':
      this.page = "ChatsPage";
      break;
    }
    resolve(this.page);
  })
  }
  protected metaInfoFetched(data?: UserMetaInfoInterface) {
    if (!data || !data.successLoads) {
      return;
    }
    this._lastLoadedNotifications = Standardize.notificationsList(data.notifications);
    if (!this._lastLoadedNotifications || !this._lastLoadedNotifications.length) {
      this._lastLoadedNotifications = [];
    }
    //check against current notificationsMap
    this._newNotifications = this._lastLoadedNotifications.filter(notification =>
      !this._notifications.find(oldNotification =>
        oldNotification && notification && oldNotification.id === notification.id));
    this._notifications.forEach((notification, index) => {
      if (!this._lastLoadedNotifications.find(newNotification =>
          newNotification && notification && newNotification.id === notification.id)) {
        //not in the new notificationsMap. Remove
        this._removedNotifications.push(this._notifications[index]);
        this.notifications.splice(index, 1);
      }
    });
    this._notifications.concat(this._newNotifications);
    this._notificationsMap = {};
    this._notifications.forEach(notification => this._notificationsMap[notification.id] = notification);
    this._notifications = this._notifications.concat(this._newNotifications);
    this.triggerNext(this._newNotifications, this._removedNotifications);
  }

  protected triggerNext(newNotifications: Notification[], removedNotifications: Notification[], onlyForCallable = null) {
    let nextObject = {
      new: newNotifications,
      removed: removedNotifications,
      all: this.notifications,
      map: this.notificationsMap
    } as NotificationsUpdatedResultInterface;
    onlyForCallable ? onlyForCallable(nextObject) : this.observableInstance.next(nextObject);
  }

  public observable() {
    return this.observableInstance;
  }

  public subscribe(callable) {
    let subscription = this.observableInstance.subscribe(callable);
    this.triggerNext([], [], callable);
    return subscription;
  }

  public fetchNewNotifications() {
    return this.userMeta.refresh();
  }
  public getNotificationDetail(notificationId): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = pidgeApiUrl( GET_NOTIFICATION_DETAIL, {id:notificationId}, null, true);
      this.apis.get(this.auth.currentUser, url, {})
        .then(result => {resolve(result)})
        .catch(error => {reject(error)});
    });
  }
  public markRead(notification: Notification): Promise<any> {
    let returnIndex = null;
    if (this._notificationsMap.hasOwnProperty(notification.id)) {
      returnIndex = this._notifications.findIndex(n => n.id === notification.id);
      delete this._notificationsMap[notification.id];
      this._notifications.splice(returnIndex, 1);
    }
    let url = pidgeApiUrl(DELETE_NOTIFICATION_URL, {id: notification.id});
    return Promise.resolve(notification.readAt = new Date)
      .then(() => this.triggerNext([], [notification]))
      .then(() => this.apis.delete(this.auth.currentUser, url, {}))
      .then(deletedNotification => notification.setRawData(deletedNotification))
      .then(() => notification)
      .catch(error => Promise.resolve(notification.readAt = null)
        .then(() => this.triggerNext([notification], []))
        //@TODO: return it to original place
        // .then(() => this._notificationsMap[notification.id] = notification)
        // .then(() => returnIndex !== null ? this._notifications = [...this._notifications.slice(0, returnIndex), notification, ...this._notifications.slice(returnIndex)] : null)
        .then(() => Promise.reject(error))
      )
      ;
  }

  get newNotifications(): Notification[] {
    return this._newNotifications;
  }

  get removedNotifications(): Notification[] {
    return this._removedNotifications;
  }

  get notifications(): Notification[] {
    return this._notifications;
  }

  get notificationsMap(): NotificationSetInterface {
    return this._notificationsMap;
  }

  get lastLoadedNotifications(): Notification[] {
    return this._lastLoadedNotifications;
  }

  public group(groupBy: GroupValueExtractor<Notification>[]) {
    let groups = new Group('root', 'root', 'root', groupBy, (notification: Notification) => notification.id.toString());
    this.notifications.forEach(notification => groups.index(notification));
    return groups;
  }
 
}

export interface NotificationSetInterface {
  [id: number]: Notification;
}

export interface NotificationsUpdatedResultInterface {
  all: Notification[];
  new: Notification[];
  removed: Notification[];
  map: NotificationSetInterface;
}
