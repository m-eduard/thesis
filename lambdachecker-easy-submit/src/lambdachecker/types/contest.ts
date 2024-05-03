import { Subject } from "../../constants";
import Problem from "./problem";

export default interface Contest {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  user_id: number;
  subject_abbreviation: Subject;
  description: string;
  problems: Problem[];
  password: boolean;

  prize?: string;
  scoring?: string;
  rules?: string;
}
