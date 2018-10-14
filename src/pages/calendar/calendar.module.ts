import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalendarPage } from './calendar';
import {MomentModule} from "angular2-moment";

@NgModule({
  declarations: [
    CalendarPage,
  ],
  imports: [
    MomentModule,
    IonicPageModule.forChild(CalendarPage),
  ],
  exports: [
    CalendarPage
  ]
})
export class CalendarPageModule {}
