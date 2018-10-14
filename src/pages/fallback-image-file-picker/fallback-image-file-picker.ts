import {Component, ElementRef, ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";

@IonicPage()
@Component({
  selector: 'page-fallback-image-file-picker',
  templateUrl: 'fallback-image-file-picker.html',
})
export class FallbackImageFilePickerPage {

  private doneCallback: any;
  private cancelCallback: any;
  private base64String: string
  private size: number = 1;

  @ViewChild("fileInput")
  private nativeInputBtn: ElementRef;

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected viewCtrl: ViewController,
              protected standardAlert: StandardResponseAlert) {

    this.doneCallback = this.navParams.get('done');
    this.cancelCallback = this.navParams.get('cancel');

  }

  protected cancel() {
    this.cancelCallback && this.cancelCallback();
    return this.viewCtrl.dismiss();
  }

  protected done() {
    this.doneCallback && this.doneCallback(this.base64String);
    return this.viewCtrl.dismiss();
  }

  protected chooseFile() {
    this.nativeInputBtn.nativeElement.click();
  }

  protected readFile($event) {
    let file: File = $event.srcElement.files[0];
    if(!file){
      return;
    }
    let myReader: FileReader = new FileReader();
    myReader.addEventListener('loadend', e => this.fileRead(myReader.result));
    myReader.readAsDataURL(file);
  }

  protected fileRead(base64String: string) {
    if (base64String.length > this.size * 1024 * 1024) {
      this.standardAlert.showError("Image size should not exceed " + this.size + "MB");
      this.base64String = null;
    } else {
      this.base64String = base64String;
    }
  }
}
