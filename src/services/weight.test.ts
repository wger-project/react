import { get_weights } from "./weight";
import axios from "axios";

jest.mock("axios");

describe("weight service tests", () => {

    test('GET weight entries', async () => {

        const weightResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                {id: 1, weight: 80, date: '2021-12-10'},
                {id: 2, weight: 90, date: '2021-12-20'},
            ]
        };

        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({data: weightResponse}));

        const result = await get_weights();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            {id: 1, weight: 80, date: '2021-12-10'},
            {id: 2, weight: 90, date: '2021-12-20'},
        ]);
    });
});
