import { createWeight, deleteWeight, getWeights, updateWeight } from "./weight";
import axios from "axios";
import { WeightEntry } from "components/BodyWeight/model";

jest.mock("axios");

describe("weight service tests", () => {

    test('GET weight entries', async () => {

        const weightResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                { id: 1, weight: 80, date: '2021-12-10' },
                { id: 2, weight: 90, date: '2021-12-20' },
            ]
        };

        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: weightResponse }));

        const result = await getWeights();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-20'), 90, 2),
        ]);
    });

    test('DELETE weight entry', async () => {

        // Arrange
        // @ts-ignore
        axios.delete.mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteWeight(1);

        // Assert
        expect(axios.delete).toHaveBeenCalledTimes(1);
        expect(result).toEqual(204);
    });

    test('PATCH weight entry', async () => {

        // Arrange
        const weightEntry = new WeightEntry(new Date('2021-12-10'), 80, 1);
        const weightResponse = { id: 1, weight: 80, date: '2021-12-10' };

        // Act
        // @ts-ignore
        axios.patch.mockImplementation(() => Promise.resolve(weightResponse));
        const result = await updateWeight(weightEntry);

        // Assert
        expect(axios.patch).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual(new WeightEntry(new Date('2021-12-10'), 80, 1));
    });

    test('POST a new weight entry', async () => {

        // Arrange
        const weightEntry = new WeightEntry(new Date('2021-12-10'), 80, 1);
        const weightResponse = { data: { id: 1, weight: 80, date: '2021-12-10' } };

        // Act
        // @ts-ignore
        axios.post.mockImplementation(() => Promise.resolve(weightResponse));
        const result = await createWeight(weightEntry);

        // Assert
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual(new WeightEntry(new Date('2021-12-10'), 80, 1));
    });

});
