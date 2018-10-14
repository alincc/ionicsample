import {Injectable} from "@angular/core";
import { Firebase } from '@ionic-native/firebase';
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";

@Injectable()
export class FirebaseNotifications {

  constructor(protected firebase: Firebase,
              protected standardAlert: StandardResponseAlert,
) {

  }
  public initializeFirebaseAndroid(callback) {
    this.firebase.getToken()
    .catch((e) => {
      console.error(e);
      callback(e)
    })
    .then(token => {
      console.log("This Android device's token is ${token}"+ token);
      callback(token)
    });
}

  public subscribeToPushNotifications(callback) {
    // handle incoming push notifications
    this.firebase.onNotificationOpen().subscribe(data => {
      if (data.tap) {
     // background received
        callback(data);
      } else {
        // foreground received
        this.standardAlert.showSuccess(data.body);
      callback(data);
      }
    }, e => {

      console.error(e);
      callback(e);
    });
  }
  public initializeFirebaseIOS() {

     this.firebase.grantPermission()
      .catch((e) => {
        console.error(e);
      })
      .then(() => {

      });
         this.firebase.hasPermission()
        .then((res: any) => {

          if (res.isEnabled) {
            console.log('We have permission to send push notifications');
          } else {
            console.log('We do not have permission to send push notifications');
          }

        });
  }

}
