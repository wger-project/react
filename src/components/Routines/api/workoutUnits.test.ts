import axios from "axios";
import { RepetitionUnit } from "@/components/Routines/models/RepetitionUnit";
import { WeightUnit } from "@/components/Routines/models/WeightUnit";
import { getRoutineRepUnits, getRoutineWeightUnits } from "@/components/Routines/api/workoutUnits";
import {
    responseEmptyUnitList,
    responseRepetitionUnits,
    responseWeightUnitsList,
} from "@/tests/workoutRoutinesTestData";
import type { Mock } from "vitest";

vi.mock("axios");

describe("workoutUnits service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("getRoutineRepUnits hits /setting-repetitionunit/ and parses results", async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseRepetitionUnits });

        const result = await getRoutineRepUnits();

        expect(axios.get).toHaveBeenCalledTimes(1);
        const [url] = (axios.get as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/setting-repetitionunit\/$/);
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(RepetitionUnit);
        expect(result[0]).toEqual(new RepetitionUnit(1, "Repetitions"));
        expect(result[1]).toEqual(new RepetitionUnit(2, "Until failure"));
    });

    test("getRoutineWeightUnits hits /setting-weightunit/ and parses results", async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseWeightUnitsList });

        const result = await getRoutineWeightUnits();

        expect(axios.get).toHaveBeenCalledTimes(1);
        const [url] = (axios.get as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/setting-weightunit\/$/);
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(WeightUnit);
        expect(result[0]).toEqual(new WeightUnit(1, "kg"));
        expect(result[1]).toEqual(new WeightUnit(2, "lb"));
    });

    test("returns an empty array when the API returns no units", async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseEmptyUnitList });

        expect(await getRoutineRepUnits()).toEqual([]);
        expect(await getRoutineWeightUnits()).toEqual([]);
    });
});
