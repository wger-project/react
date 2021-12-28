import { getWeights } from "./weight";
import axios from "axios";
import { WeightEntry } from "components/BodyWeight/model";

jest.mock("axios");

describe("weight service tests", () => {

    test('GET weight entries', async () => {

        const weightResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                { id: 1, weight: 80, date: '2021-12-10' },
                { id: 2, weight: 90, date: '2021-12-20' },
            ]
        };

        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: weightResponse }));

        const result = await getWeights();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-20'), 90, 2),
        ]);
    });

});
