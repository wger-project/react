import axios from "axios";
import { getNutritionalDiaryEntries } from "services";

jest.mock("axios");

describe("Nutritional plan diary service tests", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('Correctly filters diary entries', async () => {
        (axios.get as jest.Mock).mockImplementation(() => {
            return Promise.resolve({
                data: {
                    count: 2,
                    next: null,
                    previous: null,
                    results: []
                }
            });
        });

        await getNutritionalDiaryEntries({
            filtersetQuery: { foo: "bar" },
        });

        // No results, so no loading of ingredients or weight units
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenNthCalledWith(1,
            expect.stringContaining('foo=bar'),
            expect.anything()
        );
    });
});
