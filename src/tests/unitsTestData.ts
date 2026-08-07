import { RepetitionUnit } from "@/components/Routines/models/RepetitionUnit";
import { WeightUnit } from "@/components/Routines/models/WeightUnit";

/*
 * The units logs and slot entries are measured in. Their own module because
 * both the routine and the log fixtures need them, and reading them out of
 * each other left whichever loaded second with undefined units.
 */

export const testWeightUnitKg = new WeightUnit(1, "kg");
export const testWeightUnitLb = new WeightUnit(2, "lb");
export const testWeightUnitPlates = new WeightUnit(3, "Plates");

export const testWeightUnits = [testWeightUnitKg, testWeightUnitLb, testWeightUnitPlates];

export const testRepUnitRepetitions = new RepetitionUnit(1, "Repetitions");
export const testRepUnitUnitFailure = new RepetitionUnit(2, "Unit failure");
export const testRepUnitUnitMinutes = new RepetitionUnit(3, "Minutes");

export const testRepetitionUnits = [testRepUnitRepetitions, testRepUnitUnitFailure, testRepUnitUnitMinutes];
