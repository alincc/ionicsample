import {Notification} from "../../models/notification";
import {EventPage} from "../../pages/event/event";
import {ChatPage} from "../../pages/chat/chat";
import {NotificationUIService} from "./notification-ui-service";
import {DashboardPage} from "../../pages/dashboard/dashboard";

interface NotificationActionFunctionInterface {
  (notification: Notification, serviceProvider: NotificationUIService): Promise<any>;
}

let dismissNotificationFunction: NotificationActionFunctionInterface = (notification, serviceProvider) => {
  return serviceProvider.notificationService.markRead(notification).then(() => true);
};

let openNotificationFunction: NotificationActionFunctionInterface = (notification, serviceProvider) => {
  let page: any = DashboardPage, params = {};
  switch (notification.type) {
    case "Chats":
      page = ChatPage;
      params = {chat: notification.relatedChat, id: notification.relatedChat.uqid};
      break;
    case "EventInvitationSent":
    case "EventInvitationAccepted":
    case "EventInvitationRejected":
    case "EventInvitationConfirmed":
    case "EventInvitationCancelled":
    case "EventCreated":
    case "EventCancelled":
    case "EventChanged":
      page = EventPage;
      params = {
        event: notification.relatedEvent,
        invitation: notification.relatedInvitation,
        chat: notification.relatedChat
      };
      break;
  }
  return serviceProvider.navCtrl.push(page, params);
};

class NotificationAction {
  private _name: string;
  private _text: string;
  private _color: ("primary" | "secondary" | "dark" | "light" | "danger");
  protected handler: NotificationActionFunctionInterface;
  private _applicableTypes: string[];
  private _side: ("right" | "left");
  private _icon: string;
  private _main: boolean = false;

  constructor(parameters: { name: string, text?: string, color?: ("primary" | "secondary" | "dark" | "light" | "danger"), handler: NotificationActionFunctionInterface, applicableTypes?: string[], side?: ("right" | "left"), icon?: string, main?: boolean }) {
    let {name, text, color, handler, applicableTypes, side, icon, main} = parameters;
    this._name = name;
    this._text = text || name.replace(/^(.)|\s+(.)/g, function ($1) {
      return $1.toUpperCase()
    });
    this._color = color || "light";
    this._applicableTypes = applicableTypes || ["*"];
    this._side = side || "right";
    this.handler = handler;
    this._icon = icon;
    this._main = main || false;
  }

  public apply(notification: Notification, serviceProvider: NotificationUIService): Promise<any> {
    return this.handler(notification, serviceProvider)
      .then(() => dismissNotificationFunction(notification, serviceProvider));
  }

  public isApplicableTo(notification: Notification) {
    return this._applicableTypes.length && (this._applicableTypes[0] === "*" || this._applicableTypes.indexOf(notification.type) !== -1);
  }

  get icon(): string {
    return this._icon;
  }

  get side() {
    return this._side;
  }

  get applicableTypes(): string[] {
    return this._applicableTypes;
  }

  get name(): string {
    return this._name;
  }

  get text(): string {
    return this._text;
  }

  get color() {
    return this._color;
  }

  get isMain(): boolean {
    return this._main;
  }

}

let AllNotificationActions: NotificationAction[] = [
  new NotificationAction({name: "dismiss", color: "danger", side: "left", handler: dismissNotificationFunction}),
  new NotificationAction({name: "open", color: "primary", side: "left", handler: openNotificationFunction}),
  new NotificationAction({
    name: "accept", color: "secondary", applicableTypes: ["EventInvitationSent"], main: true,
    handler: (notification, serviceProvider) => {
      return serviceProvider.eventService.acceptEventInvitation(notification.relatedInvitation)
        .then(() => serviceProvider.successToast("Invitation accepted successfully"))
        .catch(error => serviceProvider.errorToast(error));
    }
  }),
  new NotificationAction({
    name: "reject", color: "danger", applicableTypes: ["EventInvitationSent"],
    handler: (notification, serviceProvider) => {
      return serviceProvider.eventService.rejectEventInvitation(notification.relatedInvitation)
        .then(() => serviceProvider.successToast("Invitation rejected successfully"))
        .catch(error => serviceProvider.errorToast(error));
    }
  }),
  new NotificationAction({
    name: "confirm", color: "secondary", applicableTypes: ["EventInvitationAccepted"], main: true,
    handler: (notification, serviceProvider) => {
      return serviceProvider.eventService.confirmEventParticipation(notification.relatedInvitation)
        .then(() => serviceProvider.successToast("Participation confirmed successfully"))
        .catch(error => serviceProvider.errorToast(typeof(error) == "object" ? error.message || error.error || error : error || "Error happened"));
    }
  }),
  new NotificationAction({
    name: "cancel", color: "danger", applicableTypes: ["EventInvitationAccepted"],
    handler: (notification, serviceProvider) => {
      return serviceProvider.eventService.cancelEventParticipation(notification.relatedInvitation)
        .then(() => serviceProvider.successToast("Participation cancelled successfully"))
        .catch(error => serviceProvider.errorToast(error));
    }
  }),
];

export {
  NotificationActionFunctionInterface,
  NotificationAction,
  AllNotificationActions
};
