import {Injectable} from '@angular/core';
import {IStore, IStorageEngine, StorageEngineWithFallback} from "./base";

@Injectable()
export class ArrayStorageEngine extends StorageEngineWithFallback implements IStorageEngine {

  protected _storage: IStore = {} as IStore;

  public get storage() {
    return this._storage;
  }

  selfStore(key: string, value: any): Promise<any> {
    this._storage[key] = value;
    return Promise.resolve(value);
  }

  selfRetrieve(key: string, defaultValue?: any): Promise<any> {
    return Promise.resolve(this.selfCheck(key) ? this._storage[key] : defaultValue);
  }

  selfCheck(key: string): Promise<boolean> {
    return Promise.resolve(this._storage.hasOwnProperty(key));
  }

}
