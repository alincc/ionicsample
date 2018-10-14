import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions} from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import {UserInterface} from "../../models/user";
import {AuthService} from "./auth-service";
import {VERSION_NUMBER} from "../../app/version";
import {config} from "../config/config";
import {environmentName} from "../config/environments";

@Injectable()
export class PidgeApiService {

  constructor(protected http: Http, protected auth: AuthService) {
  }

  protected addRequiredHeaders(currentUser: UserInterface, headers: Object = {}) {
    headers["Authorization"] = currentUser.uqid + " " + currentUser.token;
    return headers;
  }

  public get(currentUser: UserInterface, url: string, headers: Object = {}): Promise<any> {
    return this.authorizedCall(currentUser, "get", url, headers);
  }

  public post(currentUser: UserInterface, url: string, body: Object = {}, headers: Object = {}): Promise<any> {
    return this.authorizedCall(currentUser, "post", url, headers, body);
  }

  public put(currentUser: UserInterface, url: string, body: Object = {}, headers: Object = {}): Promise<any> {
    return this.authorizedCall(currentUser, "put", url, headers, body);
  }

  public delete(currentUser: UserInterface, url: string, headers: Object = {}): Promise<any> {
    return this.authorizedCall(currentUser, "delete", url, headers);
  }

  protected authorizedCall(currentUser: UserInterface, method: string, url: string, headers: Object = {}, body: Object = {}): Promise<any> {
    headers = this.addRequiredHeaders(currentUser, headers);
    return this.publicCall(method, url, headers, body)
      .then(resolved => Promise.resolve(resolved))
      .catch(reason => {
        if (reason.hasOwnProperty("hint") && reason.hint === "token_expired") {
          return this.renewToken(currentUser, method, url, headers);
        } else if (reason.hasOwnProperty("code") && reason.code === 406 && reason.hasOwnProperty('hint') && reason.hint === 'App Obsolete') {
          return this.auth.logout(true);
        } else {
          return Promise.reject(reason);
        }
      });
  }

  protected renewToken(currentUser: UserInterface, method: string, url: string, headers: Object, body?: Object) {
    return this.auth.loginViaTokenRenewal(AuthService.getTokenFromUser(currentUser))
      .then(user => this.authorizedCall(user, method, url, headers, body))
      .catch(err => this.auth.logout(true));
  }

  public publicGet(url, headers: Object = {}): Promise<any> {
    return this.publicCall("get", url, headers);
  }

  public publicDelete(url, headers: Object = {}): Promise<any> {
    return this.publicCall("delete", url, headers);
  }

  public publicPost(url, headers: Object = {}, body: Object = {}): Promise<any> {
    return this.publicCall("post", url, headers, body);
  }

  public publicPut(url, headers: Object = {}, body: Object = {}): Promise<any> {
    return this.publicCall("put", url, headers, body);
  }

  protected publicCall(method: string, url: string, headers: Object = {}, body: Object = {}): Promise<any> {
    let requestHeaders = new Headers(headers);
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Accept", "application/json");
    requestHeaders.append("Pidge-App", VERSION_NUMBER + "," + environmentName(config.environment));
    let options = new RequestOptions({headers: requestHeaders});
    return new Promise((resolve, reject) => {
      let httpRequest;
      switch (method.toLowerCase()) {
        case "get":
          httpRequest = this.http.get(url, options);
          break;
        case "post":
          httpRequest = this.http.post(url, body, options);
          break;
        case "put":
          httpRequest = this.http.put(url, body, options);
          break;
        case "delete":
          httpRequest = this.http.delete(url, options);
          break;
      }
      httpRequest.subscribe(response => {
        let data = response.json();
        if (data.hasOwnProperty("succeeded") && !data.succeeded) {
          throw data;
        } else {
          resolve(data);
        }
      }, error => {
        error = error.json();
        reject(error.message ? error : {message: "Server returned error"});
      });
    });
  }

}
