import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListItemPickerPage } from './list-item-picker';

@NgModule({
  declarations: [
    ListItemPickerPage,
  ],
  imports: [
    IonicPageModule.forChild(ListItemPickerPage),
  ],
})
export class ListItemPickerPageModule {}
