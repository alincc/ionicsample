import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {KeyboardEnableAutoWording} from './keyboard-enable-auto-wording';
import {KeyboardDisableAutoWording} from "./keyboard-disable-auto-wording";

@NgModule({
  declarations: [
    KeyboardEnableAutoWording,
    KeyboardDisableAutoWording,
  ],
  imports: [
    IonicPageModule.forChild(KeyboardEnableAutoWording),
    IonicPageModule.forChild(KeyboardDisableAutoWording),
  ],
  exports: [
    KeyboardEnableAutoWording,
    KeyboardDisableAutoWording,
  ]
})
export class KeyboardEnableAutoWordingModule {
}
