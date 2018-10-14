import {Injectable} from '@angular/core';
import {Stacker} from "./stacker";

@Injectable()
export class SimpleStacker extends Stacker {
  constructor() {
    super();
    this.setInit(() => true);
    this.setFinish((started?) => false);
  }
}
