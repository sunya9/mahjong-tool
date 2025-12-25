import { useContext } from "react";
import { ReadingContext } from "./ReadingContext";

export function useReading() {
  const context = useContext(ReadingContext);
  if (!context) {
    throw new Error("useReading must be used within a ReadingProvider");
  }
  return context;
}
