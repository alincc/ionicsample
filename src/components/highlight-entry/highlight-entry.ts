import {Component, ElementRef, Input, OnInit, Renderer2} from "@angular/core";
import {Color, ColorTween} from "../../shared/color";
import {NotificationViewModel} from "../../view-models/notification";
import {NotificationAction} from "../../view-models/providers/notification-actions";

@Component({
  selector: "highlight-entry",
  templateUrl: "highlight-entry.html"
})
export class HighlightEntry implements OnInit {

  @Input() notification: NotificationViewModel;
  @Input() icon: string;
  @Input() initialColor: Color = new Color(0, 38, 84);
  @Input() toLeftColor: Color = new Color(0, 140, 130);
  @Input() toRightColor: Color = new Color(245, 61, 61);
  @Input("hide-title") hideTitle: boolean = false;

  protected hasMainAction: boolean = false;
  protected rightActions: NotificationAction[] = [];
  protected leftActions: NotificationAction[] = [];

  constructor(protected elementRef: ElementRef,
              protected renderer: Renderer2) {
  }

  public ngOnInit(){
    this.rightActions = this.notification.actions.filter(action => action.side === "right").reverse();
    this.leftActions = this.notification.actions.filter(action => action.side === "left");
    this.hasMainAction = this.notification.hasApplyFunction;
  }

  public get nativeElement() {
    return this.elementRef.nativeElement;
  }

  protected applyDismissAction($event) {
    $event && $event instanceof Event && this.prohibitEvent($event);
    return this.notification.dismiss();
  }

  protected applyMainAction($event) {
    $event && $event instanceof Event && this.prohibitEvent($event);
    return this.notification.apply();
  }

  protected applyCustomAction($event, action) {
    $event && $event instanceof Event && this.prohibitEvent($event);
    return this.notification.handle(action);
  }

  protected applyOpenAction($event) {
    $event && $event instanceof Event && this.prohibitEvent($event);
    return this.notification.open();
  }

  private prohibitEvent($event) {
    $event.preventDefault();
    $event.stopPropagation();
    return false;
  }

  protected swiping($event) {
    let percent = $event.getSlidingPercent();
    let revealRightOptions = percent > 0;
    let color = new ColorTween(this.initialColor, revealRightOptions ? this.toLeftColor : this.toRightColor).perc(Math.abs(percent) / 3).hex;
    this.nativeElement.getElementsByTagName("ion-item")[0].style.backgroundColor = color;
  }

}
