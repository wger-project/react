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
                    "id": "00000000-0000-0000-0000-000000072559",
                    "creation_date": "2023-05-26",
                    "start": "2023-06-01",
                    "end": "2023-06-30",
                    "description": "first plan",
                    "only_logging": true,
                },
                {
                    "id": "00000000-0000-0000-0000-000000060131",
                    "creation_date": "2022-06-01",
                    "start": "2022-06-01",
                    "end": null,
                    "description": "",
                    "only_logging": false,
                },
                {
                    "id": "00000000-0000-0000-0000-000000024752",
                    "creation_date": "2023-08-01",
                    "start": "2023-08-01",
                    "end": "2023-08-31",
                    "description": "",
                    "only_logging": false,
                },
            ]
        };

        (axios.get as jest.Mock).mockImplementation(() => Promise.resolve({ data: planResponse }));

        const result = await getNutritionalPlansSparse();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            new NutritionalPlan({
                id: '00000000-0000-0000-0000-000000072559',
                creationDate: new Date('2023-05-26'),
                start: new Date('2023-06-01'),
                end: new Date('2023-06-30'),
                description: 'first plan',
                onlyLogging: true
            }),
            new NutritionalPlan({
                id: '00000000-0000-0000-0000-000000060131',
                creationDate: new Date('2022-06-01'),
                description: '',
                onlyLogging: false
            }),
            new NutritionalPlan({
                id: '00000000-0000-0000-0000-000000024752',
                creationDate: new Date('2023-08-01'),
                start: new Date('2023-08-01'),
                end: new Date('2023-08-31'),
                description: '',
                onlyLogging: false
            }),
        ]);
    });

});
