export interface IStore {
  [key: string]: any;
}

export interface IStorageEngine {

  storage: IStore;

  fallbackStorageEngine?: IStorageEngine;

  store(key: string, value: any): Promise<any>;

  check(key: string): Promise<boolean>;

  retrieve(key: string, defaultValue?: any): Promise<any>;

  retrieveOrStore(key: string, storeFunction): Promise<any>;

}

export abstract class StorageEngineWithFallback implements IStorageEngine {

  protected _fallbackStorageEngine?: IStorageEngine;
  protected _storage: IStore;

  get storage(): IStore {
    return this._storage;
  }

  get fallbackStorageEngine(): IStorageEngine {
    return this._fallbackStorageEngine;
  }

  set fallbackStorageEngine(value: IStorageEngine) {
    this._fallbackStorageEngine = value;
  }

  store(key: string, value: any): Promise<any> {
    this.fallbackStorageEngine && this.fallbackStore(key, value);
    return this.selfStore(key, value);
  }

  check(key: string): Promise<boolean> {
    return this.selfCheck(key)
      .then(exists => exists ? Promise.resolve(exists) : this.fallbackCheck(key));
  }

  retrieve(key: string, defaultValue?: any): Promise<any> {
    return new Promise(resolve => {
      this.selfCheck(key)
        .then(exists => exists ? this.selfRetrieve(key) : this.fallbackRetrieve(key, defaultValue))
        .then(value => resolve(value));
    });
  }

  retrieveOrStore(key: string, storeFunction): Promise<any> {
    return new Promise(resolve => {
      this.check(key)
        .then(exists => exists ? this.retrieve(key) : this.store(key, storeFunction()))
        .then(value => {
          this.store(key, value);
          resolve(value);
        });
    });
  }

  fallbackStore(key: string, value: any): Promise<any> {
    return this._fallbackStorageEngine ? this._fallbackStorageEngine.store(key, value) : Promise.reject("No storage engine found");
  }

  fallbackCheck(key: string): Promise<boolean> {
    return this._fallbackStorageEngine ? this._fallbackStorageEngine.check(key) : Promise.resolve(false);
  }

  fallbackRetrieve(key: string, defaultValue?: any): Promise<any> {
    return this._fallbackStorageEngine ? this._fallbackStorageEngine.retrieve(key, defaultValue) : Promise.resolve(defaultValue);
  }

  abstract selfStore(key: string, value: any): Promise<any>;

  abstract selfRetrieve(key: string, defaultValue?: any): Promise<any>;

  abstract selfCheck(key: string): Promise<boolean>;

}
