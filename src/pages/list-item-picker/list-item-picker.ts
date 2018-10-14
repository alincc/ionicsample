import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-list-item-picker',
  templateUrl: 'list-item-picker.html',
})
export class ListItemPickerPage {

  protected title: string = "";
  protected message: string = "";
  protected searchText: string = "";
  protected allRaws: any[];
  protected allItems: { raw: any, display: ListItemDisplay }[] = [];
  protected filteredItems: { raw: any, display: ListItemDisplay }[] = [];
  protected displayFunc: (item: any) => string | ListItemDisplay;
  protected isSelectedFunc: (item: any, selectedItem: any) => boolean;
  protected filterFunc: (item: any, search: string) => boolean;
  protected doneCallback;
  protected selectedItem: any;

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected viewCtrl: ViewController) {

    this.title = this.navParams.get('title');
    this.message = this.navParams.get('message');
    this.allRaws = this.navParams.get('list');
    this.displayFunc = this.navParams.get('display');
    this.isSelectedFunc = this.navParams.get('isSelected');
    this.doneCallback = this.navParams.get('done');
    this.filterFunc = this.navParams.get('filter');
    this.prepareDisplayList();

  }

  protected prepareDisplayList(): { raw: any, display: ListItemDisplay }[] {
    let result = [];
    for (let raw of this.allRaws) {
      let display = this.display(raw);
      result.push({raw, display});
    }
    this.allItems = result;
    this.filteredItems = this.allItems.filter(item => true);
    return result;
  }

  protected filter($event: Event) {
    this.filteredItems = this.allItems.filter(item => this.filterFunc(item.raw, this.searchText));
  }

  protected display(item): ListItemDisplay {
    let res = this.displayFunc(item);
    let displayRes: ListItemDisplay;
    if (typeof(res) === 'string') {
      displayRes = {
        title: res
      } as ListItemDisplay;
    } else {
      displayRes = res;
    }
    return displayRes;
  }

  protected select(item) {
    this.selectedItem = item;
  }

  protected cancel() {
    this.doneCallback(null);
    this.viewCtrl.dismiss();
  }

  protected done() {
    this.doneCallback(this.selectedItem);
    this.viewCtrl.dismiss();
  }

  protected isSelected(item): boolean {
    return this.selectedItem ? this.isSelectedFunc(item, this.selectedItem) : false;
  }

}

export interface ListItemDisplay {
  title: string;
  subTitle?: string;
  icon?: string;
  badge?: string;
  note?: string;
  avatar?: string;
}
