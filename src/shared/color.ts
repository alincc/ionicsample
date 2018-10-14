export class Color {

  private _red: number = 0;
  private _green: number = 0;
  private _blue: number = 0;

  constructor(red, green, blue) {
    this.red = parseInt(red);
    this.green = parseInt(green);
    this.blue = parseInt(blue);
  }

  get red(): number {
    return this._red;
  }

  set red(value: number) {
    this._red = Math.abs(value > 255 ? 255 : value);
  }

  get green(): number {
    return this._green;
  }

  set green(value: number) {
    this._green = Math.abs(value > 255 ? 255 : value);
  }

  get blue(): number {
    return this._blue;
  }

  set blue(value: number) {
    this._blue = Math.abs(value > 255 ? 255 : value);
  }

  public get hex(): string {
    return "#" + this.red.toString(16) + this.green.toString(16) + this.blue.toString(16);
  }

  public get rgb(): string {
    return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
  }

  public alterPerc(red, green, blue) {
    this.red = Math.round(this.red * red);
    this.green = Math.round(this.green * green);
    this.blue = Math.round(this.blue * blue);
    return this;
  }

}

export class ColorTween {
  private to: Color;
  private from: Color;

  constructor(from: Color, to: Color) {
    this.from = from;
    this.to = to;
  }

  public perc(perc: number): Color {
    perc = perc > 1 ? 1 : (perc < 0 ? 0 : perc);
    let red = this.from.red + Math.round((this.to.red - this.from.red) * perc);
    let blue = this.from.blue + Math.round((this.to.blue - this.from.blue) * perc);
    let green = this.from.green + Math.round((this.to.green - this.from.green) * perc);
    return new Color(red, green, blue);
  }

}
