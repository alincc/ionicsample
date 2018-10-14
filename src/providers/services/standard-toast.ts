import {Injectable} from '@angular/core';
import {ToastController, ToastOptions} from "ionic-angular";

@Injectable()
export class StandardToast {

  constructor(protected toastCtrl: ToastController) {
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

  public showError(error, alertOptions: ToastOptions = {}) {
    console.error(error);
    let text = ["string", "number", "integer", "float", "boolean"].indexOf(typeof(error)) !== -1 ? error : (error.message || error.text || error.error || "Unknown error: " + JSON.stringify(error));
    let alert = this.toastCtrl.create({
      message: text,
      cssClass: "result-toast failed",
      duration: 3000,
      dismissOnPageChange: false,
      showCloseButton: true,
      closeButtonText: "Ok",
      ...alertOptions,
    });
    return alert.present();
  }

  public showSuccess(response: any, alertOptions: ToastOptions = {}) {
    let text = ["string", "number", "integer", "float", "boolean"].indexOf(typeof(response)) !== -1 ? response : (response.message || response.text || "Operation done: " + JSON.stringify(response));
    let alert = this.toastCtrl.create({
      message: text,
      cssClass: "result-toast success",
      duration: 3000,
      dismissOnPageChange: false,
      showCloseButton: true,
      closeButtonText: "Ok",
      ...alertOptions,
    });
    return alert.present();
  }

  public showInfo(response: any, alertOptions: ToastOptions = {}) {
    let text = ["string", "number", "integer", "float", "boolean"].indexOf(typeof(response)) !== -1 ? response : (response.message || response.text || JSON.stringify(response));
    let alert = this.toastCtrl.create({
      message: text,
      cssClass: "result-toast info",
      duration: 3000,
      dismissOnPageChange: false,
      showCloseButton: true,
      closeButtonText: "Ok",
      ...alertOptions,
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
