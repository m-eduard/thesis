import { Language } from "../api";

export const languageExtensions: { [key in Language]: string } = {
  [Language.C]: ".c",
  [Language.Java]: ".java",
};
