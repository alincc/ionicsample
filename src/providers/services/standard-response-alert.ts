import {Injectable} from '@angular/core';
import {AlertController, AlertOptions} from "ionic-angular";

@Injectable()
export class StandardResponseAlert {

  constructor(protected alertCtrl: AlertController) {
  }

  public handle(response, additionalButtons: any = null) {
    if (typeof(response) === 'object') {
      if (!response.hasOwnProperty('succeeded')) {
        return this.handleNonStandard(response, additionalButtons);
      }
      return response.succeeded ? this.showSuccess(response, additionalButtons) : this.showError(response, additionalButtons);
    } else {
      return this.handleAbstract(response, additionalButtons);
    }
  }

  protected handleNonStandard(response: Object, additionalButtons: any) {
    let jsonResponse = JSON.stringify(response);
    return jsonResponse.search(/succe|done|completed|achieved/i) !== -1 ? this.showSuccess(response, additionalButtons) :
      (jsonResponse.search(/error|fail|exit/i) !== -1 ? this.showError(response, additionalButtons) : this.showInfo(response, additionalButtons));
  }

  protected handleAbstract(response: string | number | boolean | any, additionalButtons: any) {
    return response.toString().search(/succe|done|completed|achieved/i) !== -1 ? this.showSuccess(response, additionalButtons) :
      (response.toString().search(/error|fail|exit/i) !== -1 ? this.showError(response, additionalButtons) : this.showInfo(response, additionalButtons));
  }

  public showError(error, additionalButton = null, alertOptions: AlertOptions = {}) {
    console.error(error);
    let text = ["string", "number", "integer", "float", "boolean"].indexOf(typeof(error)) !== -1 ? error : (error.message || error.text || error.error || "Unknown error: " + JSON.stringify(error));
    let alert = this.alertCtrl.create({
      title: 'Error',
      message: text,
      cssClass: "result-alert failed",
      buttons: additionalButton ? ['Ok', ...additionalButton] : ['Ok'],
      ...alertOptions
    });
    return alert.present();
  }

  public showSuccess(response: any, additionalButton = null, alertOptions: AlertOptions = {}) {
    let text = ["string", "number", "integer", "float", "boolean"].indexOf(typeof(response)) !== -1 ? response : (response.message || response.text || "Operation done: " + JSON.stringify(response));
    let alert = this.alertCtrl.create({
      title: 'Success',
      message: text,
      cssClass: "result-alert success",
      buttons: additionalButton ? ['Ok', ...additionalButton] : ['Ok'],
      ...alertOptions
    });
    return alert.present();
  }

  public showInfo(response: any, additionalButton = null, alertOptions: AlertOptions = {}) {
    let text = ["string", "number", "integer", "float", "boolean"].indexOf(typeof(response)) !== -1 ? response : (response.message || response.text || JSON.stringify(response));
    let alert = this.alertCtrl.create({
      title: 'Message',
      message: text,
      cssClass: "result-alert info",
      buttons: additionalButton ? ['Ok', ...additionalButton] : ['Ok'],
      ...alertOptions
    });
    return alert.present();
  }

  public throwStandardError(message: string) {
    throw {
      succeeded: false,
      message
    };
  }

}
