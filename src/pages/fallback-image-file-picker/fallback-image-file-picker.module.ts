import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FallbackImageFilePickerPage } from './fallback-image-file-picker';

@NgModule({
  declarations: [
    FallbackImageFilePickerPage,
  ],
  imports: [
    IonicPageModule.forChild(FallbackImageFilePickerPage),
  ],
})
export class FallbackImageFilePickerPageModule {}
