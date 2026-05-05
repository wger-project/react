import axios from "axios";
import { getProfile } from "@/services";
import { testProfileApiResponse, testProfileDataVerified } from "@/tests/userTestdata";
import type { Mock } from 'vitest';

vi.mock("axios");


describe("Profile API tests", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });


    test('get the user profile (logged in)', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: testProfileApiResponse }));

        // Act
        const result = await getProfile();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(testProfileDataVerified);
    });

    test('get the user profile (logged out)', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ status: 403 }));

        // Act
        const result = await getProfile();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(null);
    });
});
