import axios from "axios";
import { checkPermission } from "services/permission";

jest.mock("axios");


describe("Permission API tests", () => {


    test('Check an exising permission', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: { "result": true } }));

        // Act
        const result = await checkPermission('exercises.delete_exercise');

        // Assert
        expect(axios.get).toHaveBeenCalled();
        expect(result).toEqual(true);
    });

    test('Check permission logged out user', async () => {
        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ status: 400 }));

        // Act
        const result = await checkPermission('exercises.sus_scrofa');

        // Assert
        expect(axios.get).toHaveBeenCalled();
        expect(result).toEqual(false);
    });
});
