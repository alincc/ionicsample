import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegularEventPage } from './regular-event';

@NgModule({
  declarations: [
    RegularEventPage,
  ],
  imports: [
    IonicPageModule.forChild(RegularEventPage),
  ],
  exports: [
    RegularEventPage
  ]
})
export class RegularEventPageModule {}
