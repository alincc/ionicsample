import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {VERSION_NUMBER} from "../../app/version";
import {config} from "../../providers/config/config";
import {CloudDeploy} from "../../providers/services/cloud-deploy";
import {AppVersion} from "@ionic-native/app-version";
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {environmentName} from "../../providers/config/environments";

@IonicPage({})
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  protected version: string = "1";
  protected versionNumber: string = VERSION_NUMBER;
  protected appName: string = "Pidge";
  protected appPackage: string = "co.pidge.mobileapp";
  protected mobile: boolean = false;
  protected updateAvailable: boolean = false;
  protected checking: boolean = false;
  protected environment = environmentName(config.environment);

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected platform: Platform,
              protected appVersion: AppVersion,
              protected cloudDeployService: CloudDeploy,
              protected analytics: AnalyticsLogger) {

    if (this.cloudDeployService.canUpdate()) {
      appVersion.getVersionNumber().then(data => this.versionNumber = VERSION_NUMBER || data);
      appVersion.getVersionCode().then(data => this.version = data);
      appVersion.getAppName().then(data => this.appName = data);
      appVersion.getPackageName().then(data => this.appPackage = data);
      this.mobile = true;
      this.cloudDeployService.subscribe(updateData => {
        this.checking = updateData.type.toLowerCase() === 'checking';
        this.updateAvailable = updateData.updateAvailable;
      });
      this.cloudDeployService.checkUpdate();
    }

  }

  ionViewDidEnter() {
    this.analytics.ga().then(ga => ga.trackView("About"));
  }

  protected update() {
    this.cloudDeployService.downloadUpdate();
  }

  protected checkForUpdate() {
    this.cloudDeployService.checkUpdate();
  }

}
