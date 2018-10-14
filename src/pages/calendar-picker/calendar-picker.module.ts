import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {CalendarPickerPage} from "./calendar-picker";
import {CalendarModule} from "../../components/calendar/calendar.module";

@NgModule({
  declarations: [
    CalendarPickerPage,
  ],
  imports: [
    CalendarModule,
    IonicPageModule.forChild(CalendarPickerPage),
  ],
  exports: [
    CalendarPickerPage
  ]
})
export class CalendarPickerPageModule {
}
