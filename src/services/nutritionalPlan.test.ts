import axios from "axios";
import { getNutritionalPlansSparse } from "services/nutritionalPlan";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";

jest.mock("axios");

describe("Nutritional plan service tests", () => {

    test('GET plans - sparse', async () => {

        const planResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                {
                    "id": 72559,
                    "creation_date": "2023-05-26",
                    "description": "first plan",
                },
                {
                    "id": 60131,
                    "creation_date": "2022-06-01",
                    "description": "",
                },
                {
                    "id": 24752,
                    "creation_date": "2023-08-01",
                    "description": "",
                },
            ]
        };

        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: planResponse }));

        const result = await getNutritionalPlansSparse();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            new NutritionalPlan(72559, new Date('2023-05-26'), 'first plan'),
            new NutritionalPlan(60131, new Date('2022-06-01'), ''),
            new NutritionalPlan(24752, new Date('2023-08-01'), ''),
        ]);
    });

});
