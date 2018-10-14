import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {DeviceContacts, IContact} from "../../providers/services/DeviceContacts";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {StandardToast} from "../../providers/services/standard-toast";

@IonicPage()
@Component({
  selector: 'page-contact-list-email',
  templateUrl: 'contact-list-email.html',
})
export class ContactListEmailPage {

  protected allContacts: IContact[] = [];
  protected filteredContacts: IContact[] = [];
  protected selectedContacts: IContact[] = [];

  protected callback: { (emails: IContact[]): void };
  protected okText: string = 'Ok';
  protected okIcon: string = 'send';
  protected _search: string = "";

  constructor(protected deviceContacts: DeviceContacts,
              protected navCtrl: NavController,
              protected navParams: NavParams,
              protected alertCtrl: AlertController,
              protected loadingStacker: LoadingStacker,
              protected standardAlert: StandardToast,
              protected platform: Platform) {
    this.okText = this.navParams.get('okText') || 'Ok';
    this.okIcon = this.navParams.get('okIcon') || 'send';
    this.callback = this.navParams.get('callback');

    if (this.platform.is("cordova")) {
      this.deviceContacts.subscribe(() => this.deviceContacts.withEmail().then(contacts => {this.allContacts = contacts;}).then(() => this.filterContacts()));
      Promise.resolve(this.loadingStacker.add())
        .then(() => this.deviceContacts.refreshContacts())
        .then(() => this.loadingStacker.pop());
    } else {
      this.showError("No native device contact access")
        .then(() => this.navCtrl.pop());
    }
  }

  get search(): string {
    return this._search;
  }

  set search(value: string) {
    this._search = value;
    this.filterContacts();
  }

  protected get saveBtnShow(): boolean {
    return this.selectedContacts.length > 0;
  }

  protected select(contact: IContact) {
    this.selectedContacts.push(contact);
  }

  protected deselect(contact: IContact) {
    this.selectedContacts.splice(this.findSelectedIndex(contact), 1);
  }

  protected toggleStatus(contact) {
    if (this.isSelected(contact)) {
      this.deselect(contact);
    } else {
      this.select(contact);
    }
  }

  protected done() {
    return Promise.resolve(this.loadingStacker.add())
      .then(() => this.callback(this.selectedContacts))
      .then(() => this.navCtrl.pop())
      .then(() => this.loadingStacker.pop());
  }

  protected showError(error) {
    return this.standardAlert.showError(error);
  }

  protected isSelected(contact: IContact) {
    return this.findSelectedIndex(contact) !== -1;
  }

  protected findSelectedIndex(contact: IContact) {
    return this.selectedContacts.findIndex(sContact => sContact.email === contact.email);
  }

  protected filterContacts() {
    this.filteredContacts = this.search.length ? this.allContacts.filter((contact: IContact) => new RegExp(this.search, 'ig').test(contact.name + '////' + contact.email)) : this.allContacts;
  }

}
