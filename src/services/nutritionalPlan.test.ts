import axios from "axios";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { getNutritionalPlansSparse } from "services/nutritionalPlan";

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
                    "only_logging": true,
                },
                {
                    "id": 60131,
                    "creation_date": "2022-06-01",
                    "description": "",
                    "only_logging": false,
                },
                {
                    "id": 24752,
                    "creation_date": "2023-08-01",
                    "description": "",
                    "only_logging": false,
                },
            ]
        };

        (axios.get as jest.Mock).mockImplementation(() => Promise.resolve({ data: planResponse }));

        const result = await getNutritionalPlansSparse();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            new NutritionalPlan(72559, new Date('2023-05-26'), 'first plan', true),
            new NutritionalPlan(60131, new Date('2022-06-01'), '', false),
            new NutritionalPlan(24752, new Date('2023-08-01'), '', false),
        ]);
    });

});
