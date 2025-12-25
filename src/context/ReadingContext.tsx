import { createContext } from "react";
import type { ReadingContextType } from "./ReadingContextType";

export const ReadingContext = createContext<ReadingContextType | null>(null);
