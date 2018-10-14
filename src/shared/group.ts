export interface StringValueExtractor<T> {
  (object: T): string;
}

export interface GroupValueExtractor<T> {
  (object: T): { value: string, display?: string, key?: string };
}

export interface GroupInterface<T> {
  idKey: string;
  id: string;
  idDisplay: string;
  subgroupsBy?: GroupValueExtractor<T>[];
  subgroupsMap?: { [groupValue: string]: GroupInterface<T> };
  subgroups?: GroupInterface<T>[];
  values?: T[];
  valueIdExtractor: StringValueExtractor<T>;
}

export class Group<T> implements GroupInterface<T> {

  protected _idKey: string;
  protected _id: string;
  protected _idDisplay: string;
  protected _subgroupsBy?: GroupValueExtractor<T>[];
  protected _subgroupsMap?: { [groupValue: string]: Group<T> } = {};
  protected _subgroups?: Group<T>[] = [];
  protected _values?: T[] = [];
  protected _valueIdExtractor: StringValueExtractor<T>;

  constructor(key: string, value: any, displayed: string, groupBy: GroupValueExtractor<T>[], idExtractor: StringValueExtractor<T>) {
    this._idKey = key;
    this._id = value;
    this._idDisplay = displayed;
    this._subgroupsBy = groupBy;
    this._valueIdExtractor = idExtractor;
  }

  public index(objToIndex: T) {
    if (this._subgroupsBy.length) {
      let groupValueExtractor = this._subgroupsBy[0] as GroupValueExtractor<T>;
      let groupExtractedValue = groupValueExtractor(objToIndex);
      let groupValue = groupExtractedValue.value;
      let groupKey = groupExtractedValue.key || groupValue;
      let groupDisplayValue = groupExtractedValue.display || groupValue;
      if (!this._subgroupsMap.hasOwnProperty(groupValue)) {
        this._subgroupsMap[groupValue] = new Group(groupKey, groupValue, groupDisplayValue, this._subgroupsBy.slice(1), this._valueIdExtractor);
        this._subgroups.push(this._subgroupsMap[groupValue]);
      }
      this._subgroupsMap[groupValue].index(objToIndex);
    }
    this._values.push(objToIndex);
  }

  public remove(objToRemove: T) {
    if (this._subgroupsBy.length) {
      let groupValueExtractor = this._subgroupsBy[0] as GroupValueExtractor<T>;
      let groupExtractedValue = groupValueExtractor(objToRemove);
      let groupValue = groupExtractedValue.value;
      if (this._subgroupsMap.hasOwnProperty(groupValue)) {
        this._subgroupsMap[groupValue].remove(objToRemove);
        if (!this._subgroupsMap[groupValue]._values.length) {
          let groupIndex = this._subgroups.findIndex((group => group._id === groupValue));
          this._subgroups.splice(groupIndex, 1);
          delete this._subgroupsMap[groupValue];
        }
      }
    }
    let findIndex = this._values.findIndex(compare => this._valueIdExtractor(objToRemove) === this._valueIdExtractor(compare));
    if (findIndex !== -1) {
      this._values.splice(findIndex, 1);
    }
  }

  get idDisplay(): string {
    return this._idDisplay;
  }

  get subgroupsBy(): GroupValueExtractor<T>[] {
    return this._subgroupsBy;
  }

  get subgroupsMap(): { [p: string]: Group<T> } {
    return this._subgroupsMap;
  }

  get subgroups(): Group<T>[] {
    return this._subgroups;
  }

  get values(): T[] {
    return this._values;
  }

  get valueIdExtractor(): StringValueExtractor<T> {
    return this._valueIdExtractor;
  }

  get id(): string {
    return this._id;
  }

  get idKey(): string {
    return this._idKey;
  }

}
