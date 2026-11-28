import axios from "axios";
import { checkPermission } from "@/components/User/api/permission";
import type { Mock } from 'vitest';

vi.mock("axios");


describe("Permission API tests", () => {


    test('Check an exising permission', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: { "result": true } }));

        // Act
        const result = await checkPermission('exercises.delete_exercise');

        // Assert
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('permission=exercises.delete_exercise'),
            expect.anything()
        );
        expect(result).toEqual(true);
    });

    test('Check permission logged out user', async () => {

        // Arrange
        // The server answers with a 400 for anonymous users, which axios rejects
        (axios.get as Mock).mockImplementation(() => Promise.reject(new Error("400")));

        // Act
        const result = await checkPermission('exercises.sus_scrofa');

        // Assert
        expect(axios.get).toHaveBeenCalled();
        expect(result).toEqual(false);
    });

    test('Check a permission the user does not have', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: { "result": false } }));

        // Act
        const result = await checkPermission('exercises.delete_exercise');

        // Assert
        expect(result).toEqual(false);
    });
});
