import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {MomentModule} from 'angular2-moment';
import {ChatsPage} from "./chats";

@NgModule({
  declarations: [
    ChatsPage,
  ],
  imports: [
    MomentModule,
    IonicPageModule.forChild(ChatsPage),
  ],
  exports: [
    ChatsPage
  ]
})
export class ChatsPageModule {}
