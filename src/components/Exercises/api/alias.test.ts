import { deleteAlias, postAlias } from "@/components/Exercises/api/alias";
import { Alias } from "@/components/Exercises/models/alias";
import axios from "axios";
import type { Mock } from 'vitest';

vi.mock("axios");


describe("Exercise alias service API tests", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });


    test('POST a new alias', async () => {

        // Arrange
        const response = {
            "id": 200,
            "uuid": "eb18288d-4ca3-4c54-8279-343b110d86e0",
            "exercise": 100,
            "alias": "Elbow dislocator",

        };
        (axios.post as Mock).mockImplementation(() => Promise.resolve({ data: response }));

        // Act
        const result = await postAlias(
            100,
            "Elbow dislocator",
        );

        // Assert
        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/exercisealias\/$/);
        // The alias belongs to a translation, not to the exercise
        expect(body).toEqual({ translation: 100, alias: "Elbow dislocator" });
        expect(result).toEqual(new Alias(200, "eb18288d-4ca3-4c54-8279-343b110d86e0", "Elbow dislocator"));
    });

    test('DELETE an existing alias', async () => {

        // Arrange
        (axios.delete as Mock).mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteAlias(100);

        // Assert
        expect(axios.delete).toHaveBeenCalledTimes(1);
        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/exercisealias\/100\/$/),
            expect.anything()
        );
        expect(result).toEqual(204);
    });
});
