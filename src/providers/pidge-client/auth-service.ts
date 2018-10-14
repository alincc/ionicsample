import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {UserInterface} from "../../models/user";
import {Subject} from "rxjs/Subject";
import {Storage} from '@ionic/storage';
import {ObservableInterface} from "../../shared/observable-interface";
import {Subscription} from "rxjs/Subscription";
import {Standardize} from "./standardize";
import {Observable} from 'rxjs/Rx';
import {pidgeApiUrl} from "./pidge-url";
import {AnalyticsLogger} from "../services/analytics-logger";
import {VERSION_NUMBER} from "../../app/version";
import {environmentName} from "../config/environments";
import {config} from "../config/config";
import {TeamInterface} from "../../models/chat";

let currentUser: UserInterface;

export const AUTH_OBSERVED_ACTION_VOID = 'void';
export const AUTH_OBSERVED_ACTION_LOGIN = 'login';
export const AUTH_OBSERVED_ACTION_WILL_LOGOUT = 'will-logout';
export const AUTH_OBSERVED_ACTION_LOGOUT = 'logout';
export const AUTH_OBSERVED_ACTION_RENEW_TOKEN = 'token-renew';

@Injectable()
export class AuthService implements ObservableInterface {

  protected static VERIFY_EMAIL_URL: string = "auth/verify-email";
  protected static LOGIN_CREDENTIALS_URL: string = "auth/login";
  protected static LOGIN_TOKEN_URL: string = "auth/login/token";
  protected static REGISTER_URL: string = "auth/register";
  protected static RENEW_TOKEN_URL: string = "auth/login/token/renew";
  protected static LOGOUT_URL: string = "auth/logout";
  protected static PUSH_NOTIFICATION_URL:string="push-notification";

  protected static ForgotPassword_URL: string = "auth/forgot-password";
  protected observableInstance: Subject<AuthObservedAction>;

  constructor(
              protected http: Http,
              protected analytics: AnalyticsLogger,
              protected storage: Storage) {
    this.observableInstance = new Subject();
  }

  public get currentUser(): UserInterface {
    return AuthService.currentUser;
  }

  public set currentUser(user: UserInterface) {
    AuthService.currentUser = user;
  }

  public static get currentUser(): UserInterface {
    return currentUser;
  }

  public static set currentUser(user: UserInterface) {
    currentUser = user;
  }

  public observable(): Subject<{ loggedIn: boolean, user: UserInterface, action: string }> {
    return this.observableInstance;
  }

  public subscribe(callable): Subscription {
    let result = this.observableInstance.subscribe(callable);
    if (this.currentUser) {
      this.triggerObservers(true, this.currentUser, AUTH_OBSERVED_ACTION_VOID, callable);
    }
    return result;
  }

  private triggerObservers(login: boolean, user?: UserInterface, action: string = AUTH_OBSERVED_ACTION_VOID, onlyForCallable = null) {
    let nextUpdate = {loggedIn: login, user: user, action: action} as AuthObservedAction;
    onlyForCallable ? onlyForCallable(nextUpdate) : this.observableInstance.next(nextUpdate);
  }

  public register(registerationData: RegisterModelInterface): Promise<UserInterface> {
    if (registerationData.name === null || registerationData.email === null || registerationData.password === null) {
      return Observable.throw("Provide name, email, and password").toPromise();
    } else {
      return this.invokeAuthApi(AuthService.REGISTER_URL, registerationData);
    }
  }

  public loginViaCredentials(credentials: CredentialsInterface): Promise<UserInterface> {
    if (credentials.email === null || credentials.password === null) {
      return Promise.reject("Please insert credentials");
    } else {
      let user: UserInterface;
      return this.invokeAuthApi(AuthService.LOGIN_CREDENTIALS_URL, credentials)
        .then(loggedInUser => user = loggedInUser)
        .then(() => {
          this.analytics.ga().then(ga => ga.trackEvent("Auth", "Login", "UserInterface:" + user.uqid));
          return user;
        });
    }
  }

  public loginViaTokenRenewal(token: TokenInterface): Promise<UserInterface> {
    if (token.token === null || token.user_id === null) {
      return Observable.throw("Provided token is invalid").toPromise();
    } else {
      return this.invokeAuthApi(AuthService.RENEW_TOKEN_URL, token, AUTH_OBSERVED_ACTION_RENEW_TOKEN);
    }
  }

  public loginViaToken(token: TokenInterface): Promise<UserInterface> {
    if (token.token === null || token.user_id === null) {
      return Observable.throw("Provided token is invalid").toPromise();
    } else {
      return this.invokeAuthApi(AuthService.LOGIN_TOKEN_URL, token);
    }
  }

  public loginLastUser(): Promise<UserInterface> {
    return new Promise((resolve, reject) => {
      try {
        this.retrieveStoredUser()
          .then((user?: UserInterface) => { //old token retrieved (or maybe null)
            if (user) { //user token exists. Login
              this.loginViaToken(AuthService.getTokenFromUser(user)) //try authentication using token
                .then((authenticatedUser: UserInterface) => {
                  this.analytics.ga().then(ga => ga.trackEvent("Auth", "Login", "UserInterface:" + user.uqid));
                  resolve(user);
                })
                .catch((error: AuthApiFailedResponseInterface) => { //token authentication failed, check reasons
                  if (error.hint && error.hint === 'token_expired') { //authentication token expired
                    this.loginViaTokenRenewal({user_id: user.id, token: user.token}) //try to renew
                      .then((user: UserInterface) => {
                        this.analytics.ga().then(ga => ga.trackEvent("Auth", "Login", "UserInterface:" + user.uqid));
                        resolve(user);
                      }, error => reject(error)) //succeeded renew and login
                      .catch((error: AuthApiFailedResponseInterface) => reject(error)); //failed, login page :(
                  } else {
                    reject(error);
                  }
                });
            } else { //no token exits
              reject("No token exist");
            }
          }, error => reject(error))
          .catch(error => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }

  public logout(offline: boolean = false): Promise<any> {
    let currentUser = this.currentUser;
    if (!this.currentUser) {
      throw "Can not logout if you did not login";
    }
    this.triggerObservers(true, this.currentUser, AUTH_OBSERVED_ACTION_WILL_LOGOUT);
    return this.storage.remove('current_user')
      .then(() => offline ? null : this.invokeApi('delete', pidgeApiUrl(AuthService.LOGOUT_URL), {}, {Authorization: this.currentUser.id.toString() + " " + this.currentUser.token}))
      .then(() => {
        this.analytics.ga().then(ga => ga.trackEvent("Auth", "Logout", "UserInterface:" + currentUser.uqid));
        this.currentUser = null;
        this.triggerObservers(false, null, AUTH_OBSERVED_ACTION_LOGOUT);
        return true;
      });
  }

  public forgotPassword(email: string): Promise<any> {
    return this.invokeApi('post', pidgeApiUrl("auth/password", {}, "1", true), {email: email})
      .then(() => Promise.resolve(true))
      .catch(err => Promise.reject(err));
  }

  protected invokeAuthApi(url: string, requestData: Object, action: string = AUTH_OBSERVED_ACTION_LOGIN): Promise<UserInterface> {
    return this.invokeApi('post', pidgeApiUrl(url), requestData)
      .then(data => {
        if (data.hasOwnProperty('token')) {
          //succeeded
          let user = Standardize.user(data);
          this.currentUser = user;
          this.storeLoggedInUser(user);
          this.triggerObservers(true, user, action);
          return Promise.resolve(user);
        } else {
          return Promise.reject(data.message ? data : {message: "Authentication or server error"});
        }
      }, error => Promise.reject(error.message ? error : {message: "Authentication or server error"}));
  }

  protected invokeApi(method: string, url: string, requestData: Object = {}, headers: Object = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let headersObj = new Headers(headers);
      headersObj.append('Content-Type', 'application/json');
      headersObj.append('Accept', 'application/json');
      headersObj.append("Pidge-App", VERSION_NUMBER + "," + environmentName(config.environment));
      let options = new RequestOptions({headers: headersObj}); // Create a request option
      let httpCall: Observable<any>;
      switch (method.toLowerCase()) {
        case 'get':
          httpCall = this.http.get(url, options);
          break;
        case 'delete':
          httpCall = this.http.delete(url, options);
          break;
        case 'post':
          httpCall = this.http.post(url, requestData, options);
          break;
        case 'put':
          httpCall = this.http.put(url, requestData, options);
      }
      httpCall.subscribe(response => resolve(response.json()), error => reject(error.json()));
    });
  }

  public getCurrentUser(): Promise<UserInterface> {
    return this.currentUser ? Promise.resolve(this.currentUser) : Promise.reject(this.currentUser);
  }

  public retrieveCurrentUser(): Promise<UserInterface> {
    return this.getCurrentUser()
      .catch(err => this.loginLastUser());
  }

  public static getTokenFromUser(user?: UserInterface): TokenInterface {
    return {token: user.token, user_id: user.id};
  }

  protected storeLoggedInUser(user: UserInterface): void {
    this.storage.set('current_user', user);
  }

  public retrieveStoredUser(): Promise<UserInterface> {
    return this.storage.get('current_user');
  }

  public resendVerificationEmail(email: string): Promise<any> {
    return this.invokeApi('put', pidgeApiUrl(AuthService.VERIFY_EMAIL_URL, {}, "1", true), {email})
      .then(response => response.message)
      .catch(() => false);
  }

  public loadInvitation(invitationUqid: string, invitationChallenge: string): Promise<UserMembershipInvitationInterface> {
    return this.invokeApi('get', pidgeApiUrl("invitations/{uqid}/{challenge}", {
      uqid: invitationUqid,
      challenge: invitationChallenge
    }, null, true));
  }



  public whenUserAuthenticated(): Promise<UserInterface> {
    let subscription: Subscription;
    return new Promise((resolve, reject) => {
      if (this.currentUser) {
        return resolve(this.currentUser);
      }
      subscription = this.subscribe(change => change.loggedIn && change.user ? (subscription && subscription.unsubscribe()) || resolve(change.user) : null);
    });
  }
}

export interface UserMembershipInvitationInterface {
  [key: string]: any;

  email: { email: string };
  uqid: string;
  challenge: string;
  data?: { name?: string };
  affiliate: TeamInterface;
}

export interface RegisterModelInterface {
  email: string;
  name: string;
  password: string;
  from_email?: string;
}

export interface CredentialsInterface {
  email: string;
  password: string;
}

export interface TokenInterface {
  token: string;
  user_id: number;
}

export interface AuthApiFailedResponseInterface {
  succeeded: boolean;
  code: number;
  message: string;
  hint?: string;
}

export interface AuthObservedAction {
  loggedIn: boolean;
  user: UserInterface;
  action: string;
}
