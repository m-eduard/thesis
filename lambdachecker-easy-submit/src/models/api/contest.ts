import { Problem } from "./problem";

export enum ContestSubject {
  DSA = "SDA",
  OOP = "POO",
}

export interface Contest {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  user_id: number;
  subject_abbreviation: ContestSubject;
  description: string;
  problems: Problem[];
  password: boolean;

  prize?: string;
  scoring?: string;
  rules?: string;
}
