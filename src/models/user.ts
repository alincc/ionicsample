import BaseModel from "./base";
import {emailGravatar} from "../providers/services/gravatar";

export interface UserInterface {

  id: number;
  uqid: string;
  name: string;
  email: string;
  image: string;
  photoName?: string;
  token?: string;
  tokenInfo?: any;

  createdAt?: Date;
  updatedAt?: Date;
  joinDate: Date;
  lastSeen: Date;

  tokenCreated?: Date;
  tokenRefreshed?: Date;
  tokenExpiry?: Date;

}

export class User extends BaseModel implements UserInterface {

  id: number;
  uqid: string;
  name: string;
  email: string;
  image: string;
  photoName?: string;
  token?: string;
  tokenInfo?: any;

  tokenCreated?: Date;
  tokenRefreshed?: Date;
  joinDate: Date;
  lastSeen: Date;

  tokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  protected get dateKeys() {
    return ['createdAt', 'updatedAt', 'tokenCreated', 'tokenRefreshed', 'tokenExpiry', 'lastSeen', 'joinDate'];
  }

  protected get rawKeysMapping() {
    return {
      "token_info": "tokenInfo",
      "created_at": "createdAt",
      "updated_at": "updatedAt",
      "join_date": "joinDate",
      "last_seen": "lastSeen",
      "token_created": "tokenCreated",
      "token_refreshed": "tokenRefreshed",
      "token_expiry": "tokenExpiry",
      "photo_name": "photoName",
    };
  }

  public constructor(userData?: UserInterface) {
    super(userData);
  }

  protected preRawDataTransform(data) {
    //@TODO:unify all into photo in APIs and here
    data["image"] = data["photo_name"] || data["photoName"] || data["photo"] || data["photoUrl"] || data["photo_url"] || data["image"] || (data["email"] && data["email"].length > 0 ? emailGravatar(data["email"]) : data["image"]);
  }

}
