import {UserInterface} from "../../models/user";
import {AuthService} from "./auth-service";

export function currentUser(): UserInterface | null {
  return AuthService.currentUser || null;
}
