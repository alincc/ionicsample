import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {HighlightGroup} from './highlight-group';
import {HighlightEntryModule} from "../highlight-entry/highlight-entry.module";

@NgModule({
  declarations: [
    HighlightGroup,
  ],
  imports: [
    HighlightEntryModule,
    IonicPageModule.forChild(HighlightGroup),
  ],
  exports: [
    HighlightGroup
  ]
})
export class HighlightGroupModule {
}
