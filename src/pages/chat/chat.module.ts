import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {MomentModule} from 'angular2-moment';
import {ChatPage} from "./chat";
import {KeyboardEnableAutoWordingModule} from "../../components/keyboard-fix/keyboard-enable-auto-wording.module";

@NgModule({
  declarations: [
    ChatPage,
  ],
  imports: [
    MomentModule,
    KeyboardEnableAutoWordingModule,
    IonicPageModule.forChild(ChatPage),
  ],
  exports: [
    ChatPage
  ]
})
export class ChatPageModule {
}
