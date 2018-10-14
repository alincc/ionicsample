import {Injectable} from "@angular/core";
import {Alert, AlertController, Loading, Platform} from "ionic-angular";
import {Subject} from "rxjs/Subject";
import {config} from "../config/config";
import {VERSION_NUMBER} from "../../app/version";
import {SemanticVersion} from "../../shared/semantic-version";
import {environmentName} from "../config/environments";
import {StandardResponseAlert} from "./standard-response-alert";
import {LoadingStacker} from "../stacker/loading-stacker";

let updateIsInProgress: boolean = false;

@Injectable()
export class CloudDeploy {

  protected alert: Alert;
  protected _observable: Subject<{ type: string, updateAvailable: boolean | string }> = new Subject();
  protected updateAvailable: boolean = false;

  constructor(protected platform: Platform,
              protected alertCtrl: AlertController,
              protected standardAlert: StandardResponseAlert,
              protected loadingStacker: LoadingStacker) {
  }

  public observable(): Subject<{ type: string, updateAvailable: boolean | string }> {
    return this._observable;
  }

  public checkUpdate(): Promise<any> {
    // if (updateIsInProgress) {
    //   return Promise.resolve(false);
    // }
    // this.deploy.channel = environmentName(config.environment);
    // this.observable().next({type: "checking", updateAvailable: false});
    // return this.deploy.check()
    //   .then((snapshotAvailable: boolean) => {
    //       if (!snapshotAvailable) {
    //         this.observable().next({type: "result", updateAvailable: false});
    //         this.updateAvailable = false;
    //         updateIsInProgress = false;
    //         return false;
    //       }
    //       this.getUpdateMetadata()
    //         .then(metadata => {
    //           this.updateAvailable = snapshotAvailable;
    //           this.observable().next({type: "result", updateAvailable: metadata.version});
    //           if (metadata.force) {
    //             this.downloadUpdate(false, "Applying critical update.");
    //           } else {
    //             this.confirmUpdate(metadata.version);
    //           }
    //         })
    //         .catch(e => {
    //           this.observable().next({type: "result", updateAvailable: false});
    //           this.updateAvailable = false;
    //           return false;
    //         });
    //     }
    //   );
    //@TODO: Abeer, migrate to the new version and services
    return Promise.resolve(false);
  }

  public downloadUpdate(silent: boolean = false, message: string = "Your app is getting updated.. Please wait..") {
    // updateIsInProgress = true;
    // if (!silent) {
    //   this.loadingStacker.add(message);
    // }
    // this.deploy.download()
    //   .then(() => this.deploy.extract())
    //   .then(() => this.loadingStacker.pop())
    //   .then(() => this.loadingStacker.add("Running the app"))
    //   .then(() => this.deploy.load())
    //   .catch(e => this.standardAlert.showError(e))
    //   .then(() => updateIsInProgress = false)
    //   .then(() => this.loadingStacker.pop())
    // ;
    //@TODO: Abeer, migration
  }

  protected confirmUpdate(version: boolean | string = true) {
    // this.alert = this.alertCtrl.create({
    //   title: version === true ? "Update Available" : "Version " + version + " available",
    //   message: "We found an update for your Pidge app. Do you want to download and install it?",
    //   buttons: [
    //     {
    //       text: "Cancel",
    //       role: "cancel",
    //       handler: () => {
    //       }
    //     },
    //     {
    //       text: "Update",
    //       handler: () => {
    //         this.alert.dismiss();
    //         this.downloadUpdate();
    //       }
    //     }
    //   ]
    // });
    // this.alert.present();
  }

  public subscribe(callback: (updateAvailable) => any) {
    let result = this.observable().subscribe(callback);
    // this.observable().next({type: "subscribe", updateAvailable: this.updateAvailable});
    return result;
  }

  public canUpdate(): boolean {
    // return !(!this.platform.is("cordova") || this.platform.is("mobileweb"));
    return false;
  }

  public getUpdateMetadata(): Promise<{ version: boolean | string, force?: boolean, raw?: object }> {
    // return this.deploy.getMetadata()
    //   .then(metadata => {
    //     let localVersion = SemanticVersion.parse(VERSION_NUMBER);
    //     let localEnvironment = environmentName(config.environment);
    //     let platformUpdatible = this.canUpdate();
    //     let remoteVersion = SemanticVersion.parse(metadata.version);
    //     let removeEnvironment = metadata.channel || metadata.env || metadata.environment;
    //     let updateApplicable = platformUpdatible && remoteVersion && removeEnvironment && removeEnvironment === localEnvironment && remoteVersion.compare(localVersion) === 1 ? remoteVersion.toString() : false;
    //     if (!updateApplicable) {
    //       throw false;
    //     }
    //     return {version: metadata.version, force: metadata.force, raw: metadata};
    //   });
    return Promise.resolve({version: false, force: false});
  }

}
