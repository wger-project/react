import axios from "axios";
import { getProfile } from "services/profile";
import { testProfileApiResponse, testProfileDataVerified } from "tests/userTestdata";

jest.mock("axios");


describe("Profile API tests", () => {


    test('get the user profile (logged in)', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: testProfileApiResponse }));

        // Act
        const result = await getProfile();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(testProfileDataVerified);
    });

    test('get the user profile (logged out)', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ status: 403 }));

        // Act
        const result = await getProfile();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(null);
    });
});
