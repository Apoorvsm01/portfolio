// Every evidence file in this folder, as one array. Add each new file here.
import type { Evidence } from "../../../src/lib/ask/types";
import sample from "./sample.json";

export const evidence: Evidence[] = [...(sample as Evidence[])];
