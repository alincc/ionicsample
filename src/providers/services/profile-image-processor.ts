import {Injectable} from '@angular/core';
import {AlertController, App, ModalController, Platform} from "ionic-angular";
import {Camera, CameraOptions} from "@ionic-native/camera";
import {StandardResponseAlert} from "./standard-response-alert";
import {FallbackImageFilePickerPage} from "../../pages/fallback-image-file-picker/fallback-image-file-picker";

@Injectable()
export class ProfileImageProcessor {

  constructor(protected alertCtrl: AlertController,
              protected camera: Camera,
              protected platform: Platform,
              protected app: App,
              protected standardAler: StandardResponseAlert,
              protected modalCtrl: ModalController) {

  }

  public changePhoto(dimension: number = 128, quality: number = 50): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.platform.is('cordova')) {
        //@TODO:implement resizer and cropper
        return this.modalCtrl.create(FallbackImageFilePickerPage, {
          done: base64ImageString => resolve(base64ImageString),
          cancel: () => resolve(null)
        }, {}).present();
      }
      this.alertCtrl.create({
        title: 'Choose the Source',
        message: 'Set the photo from',
        buttons: [
          {
            text: 'Camera',
            role: "cancel",
            handler: () => {
              this.takeFromCamera({quality, targetWidth: 128, targetHeight: 128})
              // .then(imgStr => this.resize(imgStr, dimension, quality))
                .then(imgStr => resolve(imgStr))
              ;
            }
          },
          {
            text: 'Photos',
            role: "cancel",
            handler: () => {
              this.changePhotoFromPhotos({quality})
              // .then(imgStr => this.resize(imgStr, dimension, quality))
                .then(imgStr => resolve(imgStr))
              ;
            }
          },
          {
            text: 'Cancel',
            role: "cancel",
            handler: () => {
              reject("Cancelled");
            }
          }
        ]
      }).present();
    });
  }

  private changePhotoFromPhotos(options: CameraOptions = null): Promise<string> {
    return this.camera.getPicture(this.getOptions(options || {}, {sourceType: this.camera.PictureSourceType.PHOTOLIBRARY}));
  }

  private takeFromCamera(options: CameraOptions = null): Promise<string> {
    return this.camera.getPicture(this.getOptions(options || {}, {sourceType: this.camera.PictureSourceType.CAMERA}));
  }

  protected getOptions(options: CameraOptions, override: CameraOptions) {
    let result: CameraOptions;
    result = {
      allowEdit: true,
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      ...options,
      ...override
    } as CameraOptions;
    return result;
  }

}
