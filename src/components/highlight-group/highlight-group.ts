import {Component, Input} from '@angular/core';
import {Group} from "../../shared/group";
import {Notification} from "../../models/notification";

@Component({
  selector: 'highlight-group',
  templateUrl: 'highlight-group.html'
})
export class HighlightGroup {

  @Input() group: Group<Notification>
  @Input() isExpanded: IsExpanded;
  @Input() toggle: Toggle;
  @Input() entryViewModel;
  @Input() grouped: boolean = true;

  constructor() {

  }

}

export interface IsExpanded {
  (group: Group<Notification>): boolean;
}

export interface Toggle {
  (group: Group<Notification>): void;
}
