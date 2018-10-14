import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {ChatCalendarPage} from "./chat-calendar";

@NgModule({
  declarations: [
    ChatCalendarPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatCalendarPage),
  ],
  exports: [
    ChatCalendarPage
  ]
})
export class ChatCalendarPageModule {}
