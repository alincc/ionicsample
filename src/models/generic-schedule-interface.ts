export interface GenericScheduleInterface {
  // [key: string]: any;

  name: string,
  note: string;
  location: string;
  type: string;
  date: string;

  repeat?: "Daily" | "Weekly" | "Monthly" | "No";
  stopRepeatingDate?: string;

  id?: number;
  uqid?: string;
  team_uqid: string;
  team_id?: number;
  regular_id?: number;
  regular_uqid?: number;
}


