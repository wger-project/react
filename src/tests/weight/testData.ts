import { WeightEntry } from "components/BodyWeight/model";

export const testWeightEntry1 = new WeightEntry(new Date('2023-11-01'), 100, 1);
export const testWeightEntry2 = new WeightEntry(new Date('2023-10-01'), 90, 2);
export const testWeightEntry3 = new WeightEntry(new Date('2023-09-01'), 110, 3);

export const testWeightEntries = [testWeightEntry1, testWeightEntry2, testWeightEntry3];