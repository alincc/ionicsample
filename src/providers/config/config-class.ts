import {Environments} from "./environments";

export interface ConfigInterface {
  [key: string]: string | Date | number | ConfigInterface | boolean;
}

export type ApiVersion = "1" | "1.1" | "SemVer" | "Recent" | "Oldest" | "Smart";

export class Config implements ConfigInterface {

  [key: string]: string | Date | number | ConfigInterface | boolean;
  environment: Environments;
  api_version: ApiVersion;
  base_url: string;
  load_messages_refresh_rate: number;
  load_meta_data_refresh_rate: number;
  team_slots_first_day: number;
  event_invitation_hours_to_close: number;
  event_invitation_admin_hours_to_close: number;
  ionic_app_id: string;
  google_analytics_id: string;
  app_url:string;
  deeplink_url:string;

  constructor(data: ConfigInterface) {
    for (let key in data) {
      this[key] = data[key];
    }
  }

}
