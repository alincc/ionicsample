import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {HighlightEntry} from './highlight-entry';
import {MomentModule} from "angular2-moment";

@NgModule({
  declarations: [
    HighlightEntry,
  ],
  imports: [
    MomentModule,
    IonicPageModule.forChild(HighlightEntry),
  ],
  exports: [
    HighlightEntry
  ]
})
export class HighlightEntryModule {
}
