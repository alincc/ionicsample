import {Injectable} from '@angular/core';
import {PidgeApiService} from "./pidge-api-service";
import {AuthService} from "./auth-service";
import {UserInterface} from "../../models/user";
import {pidgeApiUrl} from "./pidge-url";

@Injectable()
export class UserService {

  protected static USER_IMAGE: string = "user/image";
  protected static USER_DATE_URL: string = "user/data/{key}";
  protected static PUSH_NOTIFICATION_URL:string="push-notification";

  constructor(protected auth: AuthService,
              protected apis: PidgeApiService) {
  }

  public loadUserProfileByEmail(email: string): Promise<UserInterface> {
    return new Promise((resolve, reject) => {
      try {
        this.apis.get(this.auth.currentUser, pidgeApiUrl("users/find", {email: email}), {})
          .then(user => resolve(user), error => reject(error))
          .catch(error => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }

  public saveUserValue(key: string, value: any, toToken: boolean = true) {
    return new Promise((resolve, reject) => {
      this.apis.post(this.auth.currentUser, pidgeApiUrl(UserService.USER_DATE_URL, {key: key}), {
        value: value,
        token: toToken
      }, {})
        .then(data => resolve(data), error => reject(error))
        .catch(error => reject(error));
    });
  }

  public retrieveUserValue(key: string, value: any) {
    return new Promise((resolve, reject) => {
      this.apis.get(this.auth.currentUser, pidgeApiUrl(UserService.USER_DATE_URL, {key: key}), {})
        .then(data => resolve(data), error => reject(error))
        .catch(error => reject(error));
    });
  }

  public removeUserValue(key: string) {
    return new Promise((resolve, reject) => {
      this.apis.delete(this.auth.currentUser, pidgeApiUrl(UserService.USER_DATE_URL, {key: key}), {})
        .then(data => resolve(data), error => reject(error))
        .catch(error => reject(error));
    });
  }


  public savePhoto(imageData: string) {
    return this.apis.put(this.auth.currentUser, pidgeApiUrl(UserService.USER_IMAGE, {}), {image: imageData}, {})
      .then(data => {
        this.auth.currentUser.image = 'data:image/jpg;base64,' + imageData.replace(/^(unsafe\:)?(data\:image\/[a-z]{3,4}\;base64\,)?/, '');
        return data;
      });
  }

  public changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.apis.put(this.auth.currentUser, pidgeApiUrl('users/me/password', {}, "1", true), {
      old_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword
    });
  }
   public senPushNotification(push_token: string,device_os:string) : Promise<any>{
     return new Promise((resolve, reject) => {
        this.apis.put(this.auth.currentUser, pidgeApiUrl(UserService.PUSH_NOTIFICATION_URL,{},'1',true),{"push_token":push_token,"device_os":device_os},{})
        .then(chat => resolve(chat))
        .catch(error => reject(error));
         });
  }
}
