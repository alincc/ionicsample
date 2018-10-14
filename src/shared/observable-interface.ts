import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";

export interface ObservableInterface {

  observable(): Subject<any>;
  subscribe(callable): Subscription;

}
