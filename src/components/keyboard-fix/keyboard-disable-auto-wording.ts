import {AfterViewInit, Directive, ElementRef, Renderer2} from "@angular/core";

@Directive({
  selector: '[disable-keyboard-auto-words]'
})
export class KeyboardDisableAutoWording implements AfterViewInit {

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
      this.renderer.removeAttribute(input, 'autocomplete');
      this.renderer.removeAttribute(input, 'autocorrect');
      this.renderer.removeAttribute(input, 'autocapitalize');
      this.renderer.removeAttribute(input, 'spellcheck');
    }

  }

}
