import axios from "axios";
import { getSessions } from "services";

jest.mock("axios");

describe("Session service tests", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('Correctly filters sessions and log entries', async () => {
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

        await getSessions({
            filtersetQueryLogs: { foo: "bar" },
            filtersetQuerySessions: { baz: 1234 }
        });

        // No results, so no loading of ingredients or weight units
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(axios.get).toHaveBeenNthCalledWith(1,
            expect.stringContaining('foo=bar'),
            expect.anything()
        );
        expect(axios.get).toHaveBeenNthCalledWith(2,
            expect.stringContaining('baz=1234'),
            expect.anything()
        );
    });
});
