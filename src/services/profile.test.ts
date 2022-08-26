import axios from "axios";
import { getProfile } from "services/profile";
import { Profile } from "components/User/models/profile";

jest.mock("axios");


describe("Profile API tests", () => {


    test('get the user profile (logged in)', async () => {

        // Arrange
        const response = {
            username: 'admin',
            email: 'admin@google.com',
            email_verified: false,
        };
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({data: response}));

        // Act
        const result = await getProfile();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(new Profile('admin', 'admin@google.com', false));
    });

    test('get the user profile (logged out)', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({status: 403}));

        // Act
        const result = await getProfile();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(null);
    });
});
