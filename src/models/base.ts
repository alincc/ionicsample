abstract class BaseModel {

  protected abstract get dateKeys(): string[];

  protected abstract get rawKeysMapping(): { [key: string]: string };

  protected _rawLoaded;

  protected constructor(rawData: Object) {
    this.setRawData(rawData);
  }

  public setRawData(rawData: Object) {
    this.preRawDataTransform(rawData);
    this._rawLoaded = rawData;
    for (let key in rawData) {
      let value = rawData[key];
      if (this.rawKeysMapping.hasOwnProperty(key)) {
        key = this.rawKeysMapping[key];
      }
      if (this.hasOwnProperty(key) && this[key] && !value) {
        continue;
      }
      this[key] = value;
    }
    this.transformDateValues();
    this.postRawDataTransform();
  }

  public get rawLoadedData() {
    return this._rawLoaded;
  }

  protected preRawDataTransform(data: Object) {
  }

  protected postRawDataTransform() {

  }

  protected transformDateValues() {
    for (let key of this.dateKeys) {
      this[key] = this[key] ? new Date(this[key]) : this[key];
    }
  }

}

export default BaseModel;
