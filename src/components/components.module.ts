import {NgModule} from '@angular/core';
import {LoadingModalComponent} from './loading-modal/loading-modal';
import {AccordionComponent} from './accordion/accordion';

@NgModule({
  declarations: [
    LoadingModalComponent,
    AccordionComponent],
  imports: [],
  exports: [
    LoadingModalComponent,
    AccordionComponent]
})
export class ComponentsModule {
}
