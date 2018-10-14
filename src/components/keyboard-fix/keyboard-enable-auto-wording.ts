import {AfterViewInit, Directive, ElementRef, Renderer2} from "@angular/core";

@Directive({
  selector: '[enable-keyboard-auto-words]'
})
export class KeyboardEnableAutoWording implements AfterViewInit {

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2) {
  }

  ngAfterViewInit() {

    let input = null;

    if (this.elementRef.nativeElement.tagName === 'ION-TEXTAREA') {
      input = this.elementRef.nativeElement.querySelector("textarea");
    } else {
      input = this.elementRef.nativeElement.querySelector("input");
    }

    if (input) {
      this.renderer.setAttribute(input, 'autocomplete', 'on');
      this.renderer.setAttribute(input, 'autocorrect', 'on');
      this.renderer.setAttribute(input, 'autocapitalize', 'on');
      this.renderer.setAttribute(input, 'spellcheck', 'on');
    }

  }

}
