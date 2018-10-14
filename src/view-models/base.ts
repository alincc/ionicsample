import BaseModel from "../models/base";

abstract class BaseViewModel<T extends BaseModel> {

  protected _model: T;

  constructor(model: T) {
    this._model = model;
  }

  public get model(): T {
    return this._model;
  }

}

export default BaseViewModel;
