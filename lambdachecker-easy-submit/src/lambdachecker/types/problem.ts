export default interface Problem {
  id: number;
  name: string;
  user: Record<string, unknown>;
  visible: boolean;
  difficulty: string;
  categories: string;
  language: string;
  description: string;
  skeleton: ProblemSkeleton;
  example: ProblemTest;
  tests: ProblemTest[];
  is_owner: boolean;

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
