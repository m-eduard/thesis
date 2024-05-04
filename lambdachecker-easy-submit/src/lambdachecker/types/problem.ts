import { Difficulty, Language } from "../../constants";

export default interface Problem {
  id: number;
  name: string;
  visible: boolean;
  difficulty: Difficulty;
  categories: string;
  language: Language;

  user?: Record<string, unknown>;
  description?: string;
  skeleton?: ProblemSkeleton;
  example?: ProblemTest;
  tests?: ProblemTest[];
  is_owner?: boolean;

  created_at?: string;
  example_id?: number;
  language_id?: number;
  skeleton_id?: number;
  updated_at?: string;
  user_id?: number;
}

interface ProblemSkeleton {
  code: string;
}

interface ProblemTest {
  input: string;
  output: string;
  grade: number;
}
