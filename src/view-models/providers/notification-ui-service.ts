import {NavController} from "ionic-angular";
import {Notification} from "../../models/notification";
import {NotificationViewModel} from "../notification";
import {AllNotificationActions, NotificationAction} from "./notification-actions";
import {NotificationService} from "../../providers/pidge-client/notification-service";
import {EventService} from "../../providers/pidge-client/event-service";
import notificationIcon from "./notification-icons";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {StandardToast} from "../../providers/services/standard-toast";

export class NotificationUIService {

  protected static actionsByType: { [type: string]: NotificationAction[] } = {};

  constructor(public navCtrl: NavController,
              public notificationService: NotificationService,
              public eventService: EventService,
              public toastCtrl: StandardToast,
              public loadingStacker: LoadingStacker) {
  }

  public successToast(message: string) {
    return this.toast(message, false);
  }

  public errorToast(error: any) {
    return this.toast(error, true);
  }

  public toast(message: string, error: boolean = false) {
    return error ? this.toastCtrl.showError(message) : this.toastCtrl.showSuccess(message);
  }

  public getViewModel(notification: Notification): NotificationViewModel {
    return new NotificationViewModel(notification, this.icon(notification), this.getActions(notification), this);
  }

  public icon(notification: Notification, action: string = ""): string {
    return notificationIcon(`${notification.type}${action}`);
  }

  public open(notification: NotificationViewModel): Promise<any> {
    let action = notification.actions.find(notificationAction => notificationAction.name === "open");
    if (!action) {
      return this.dismiss(notification);
    }
    return this.handle(notification, action);
  }

  public apply(notification: NotificationViewModel): Promise<any> {
    let action = notification.actions.find(notificationAction => notificationAction.isMain);
    if (!action) {
      return this.dismiss(notification);
    }
    return this.handle(notification, action);
  }

  public dismiss(notification: NotificationViewModel): Promise<any> {
    let action = notification.actions.find(notificationAction => notificationAction.name === "dismiss");
    return this.handle(notification, action);
  }

  public handle(notification: NotificationViewModel, action: NotificationAction): Promise<any> {
    // this.loadingStacker.add()
    return action.apply(notification.model, this)
      .then(() => action.name === 'dismiss' ? null : this.dismiss(notification))
      .catch(e => this.toastCtrl.showError(e))
      // .then(() => this.loadingStacker.pop())
      ;
  }

  public getActions(notification: Notification): NotificationAction[] {
    let type = notification.type;
    if (!NotificationUIService.actionsByType.hasOwnProperty(type)) {
      NotificationUIService.actionsByType[type] = AllNotificationActions.filter(notificationAction => notificationAction.isApplicableTo(notification));
    }
    return NotificationUIService.actionsByType[type];
  }

}
