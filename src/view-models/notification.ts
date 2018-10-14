import BaseViewModel from "./base";
import {Notification} from "../models/notification";
import {NotificationAction} from "./providers/notification-actions";
import {UserInterface} from "../models/user";
import {Chat} from "../models/chat";
import {EventInvitation} from "../models/event-invitation";
import {Event} from "../models/event";
import {NotificationUIService} from "./providers/notification-ui-service";

export class NotificationViewModel extends BaseViewModel<Notification> {

  private _icon: string;
  private _actions: NotificationAction[];

  constructor(notification: Notification, icon: string, actions: NotificationAction[], protected uiService: NotificationUIService) {
    super(notification);
    this._actions = actions;
    this._icon = icon;
  }

  get icon(): string {
    return this._icon;
  }

  get actions(): NotificationAction[] {
    return this._actions;
  }

  get id(): number {
    return this.model.id;
  };

  get title(): string {
    return this.model.title;
  };

  get type(): string {
    return this.model.type;
  };

  get message(): string {
    return this.model.message;
  };

  get data(): any {
    return this.model.data;
  };

  get user(): UserInterface {
    return this.model.user;
  };

  get relatedUser(): UserInterface {
    return this.model.relatedUser;
  };

  get relatedChat(): Chat {
    return this.model.relatedChat;
  };

  get relatedEvent(): Event {
    return this.model.relatedEvent;
  };

  get relatedInvitation(): EventInvitation {
    return this.model.relatedInvitation;
  };

  get createdAt(): Date {
    return this.model.createdAt;
  };

  get updatedAt(): Date {
    return this.model.updatedAt;
  };

  get readAt(): Date {
    return this.model.readAt;
  };

  public get hasApplyFunction(): boolean {
    return this.actions.findIndex(action => action.isMain) !== -1;
  }

  public dismiss() {
    return this.uiService.dismiss(this);
  }

  public apply() {
    return this.uiService.apply(this);
  }

  public open() {
    return this.uiService.open(this);
  }

  public handle(action: NotificationAction) {
    return this.uiService.handle(this, action);
  }

}
