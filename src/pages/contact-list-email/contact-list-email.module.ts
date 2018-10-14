import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactListEmailPage } from './contact-list-email';

@NgModule({
  declarations: [
    ContactListEmailPage,
  ],
  imports: [
    IonicPageModule.forChild(ContactListEmailPage),
  ],
})
export class ContactListEmailPageModule {}
