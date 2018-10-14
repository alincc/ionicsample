import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamInfoPage } from './team-info';
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    TeamInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(TeamInfoPage),
    ComponentsModule,
  ],
})
export class TeamInfoPageModule {}
