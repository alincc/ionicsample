import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {DashboardPage} from "./dashboard";
import {MomentModule} from "angular2-moment/moment.module";
import {HighlightEntryModule} from "../../components/highlight-entry/highlight-entry.module";
import {HighlightGroupModule} from "../../components/highlight-group/highlight-group.module";

@NgModule({
  declarations: [
    DashboardPage,
  ],
  imports: [
    MomentModule,
    HighlightEntryModule,
    HighlightGroupModule,
    IonicPageModule.forChild(DashboardPage),
  ],
  exports: [
    DashboardPage
  ]
})
export class DashboardPageModule {}
