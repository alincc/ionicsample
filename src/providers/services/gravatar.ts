import md5 from 'crypto-md5';
import {UserInterface} from "../../models/user";

const BASE_URL = "https://www.gravatar.com/avatar/";

function hash(str): string {
  return md5(str, 'hex');
}

export function userGravatar(user: UserInterface): string {
  return emailGravatar(user.email);
}

export function emailGravatar(email: string): string {
  return BASE_URL + hash(email);
}
