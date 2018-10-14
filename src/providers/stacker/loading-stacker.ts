import {Injectable} from '@angular/core';
import {Stacker} from "./stacker";
import {Loading, LoadingController, LoadingOptions} from "ionic-angular";

@Injectable()
export class LoadingStacker extends Stacker {

  protected initiated: Loading;

  public readonly loadingOptions: LoadingOptions = {
    content: "Loading...",
    dismissOnPageChange: false,
    showBackdrop: true,
    enableBackdropDismiss: false,
    duration: 0,
    cssClass: 'stacked-loading'
  } as LoadingOptions;

  constructor(loadingCtrl: LoadingController) {
    super();
    this.setInit(() => {
      let loading = loadingCtrl.create(this.loadingOptions);
      loading.present();
      return loading;
    });
    this.setFinish((loading?) => {
      loading && loading.dismiss && loading.dismiss();
      return null;
    });
  }

  public add(message: string = 'Loading...') {
    super.add(message);
    if (message) {
      this.initiated.setContent(message);
    }
  }

  public pop() {
    super.pop();
    if (!this.isEmpty()) {
      this.initiated.setContent(this.message);
    }
  }

}
