import { ProblemMetadataContestContext } from "./problem";

export enum ContestSubject {
  DSA = "SDA",
  OOP = "POO",
}

export const getAcademicYearsRange = (): string[] =>
  [...Array(new Date().getFullYear() - 2022)].map(
    (_, offset) => `${2022 + offset - 1}-${2022 + offset}`
  );

export interface Contest {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  user_id: number;
  subject_abbreviation: ContestSubject;
  description: string;
  problems: ProblemMetadataContestContext[];
  password: boolean;

  prize?: string;
  scoring?: string;
  rules?: string;
}
