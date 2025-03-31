import axios from "axios";
import { DayAdapter } from "components/WorkoutRoutines/models/Day";
import { addDay, deleteDay, editDay, editDayOrder } from "services";
import { AddDayParams, EditDayOrderParam, EditDayParams } from "services/day";

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('editDay', () => {

    const mockDayData = {
        id: 1,
        routine: 1,
        name: 'Test Day',
        description: 'A test day',
        order: 1,
        is_rest: false,
    };

    const mockEditDayParams: EditDayParams = {
        id: 1,
        name: 'Updated Day',
    };

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    test('should update a day and return the updated day', async () => {
        mockedAxios.patch.mockResolvedValue({ data: mockDayData });

        const updatedDay = await editDay(mockEditDayParams);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        expect(updatedDay).toEqual(new DayAdapter().fromJson(mockDayData));
    });

    test('should handle errors gracefully', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.patch.mockRejectedValue(new Error(errorMessage));

        await expect(editDay(mockEditDayParams)).rejects.toThrowError(errorMessage);
        expect(axios.patch).toHaveBeenCalledTimes(1);
    });
});


describe('editDayOrder', () => {
    const mockDayOrders: EditDayOrderParam[] = [
        { id: 1, order: 3 },
        { id: 2, order: 1 },
        { id: 3, order: 2 },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should update the order of multiple days', async () => {
        mockedAxios.patch.mockResolvedValue({ status: 200 });

        await editDayOrder(mockDayOrders);

        expect(axios.patch).toHaveBeenCalledTimes(mockDayOrders.length);
        mockDayOrders.forEach(({ id, order }) => {
            expect(axios.patch).toHaveBeenCalledWith(
                expect.any(String),
                { order },
                expect.any(Object)
            );
        });
    });

    test('should handle errors gracefully', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.patch.mockRejectedValueOnce(new Error(errorMessage));

        await expect(editDayOrder(mockDayOrders)).rejects.toThrow(errorMessage);
        expect(axios.patch).toHaveBeenCalledTimes(1);
    });
});

describe('addDay', () => {
    const mockDayData = {
        id: 1,
        routine: 1,
        name: 'Test Day',
        description: 'A test day',
        order: 1,
        is_rest: false,
        need_logs_to_advance: false,
    };

    const mockAddDayParams: AddDayParams = {
        routine: 1,
        name: 'Test Day',
        description: 'A test day',
        order: 1,
        is_rest: false,
        need_logs_to_advance: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should create a new day and return the created day', async () => {
        mockedAxios.post.mockResolvedValue({ data: mockDayData });

        const newDay = await addDay(mockAddDayParams);

        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(newDay).toEqual(new DayAdapter().fromJson(mockDayData));
    });

    test('should handle errors gracefully', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.post.mockRejectedValue(new Error(errorMessage));

        await expect(addDay(mockAddDayParams)).rejects.toThrow(errorMessage);
        expect(axios.post).toHaveBeenCalledTimes(1);
    });
});


describe('deleteDay', () => {
    const mockDayId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should delete a day', async () => {
        mockedAxios.delete.mockResolvedValue({ status: 204 }); // Assuming a successful delete returns 204 No Content

        await deleteDay(mockDayId);

        expect(axios.delete).toHaveBeenCalledTimes(1);
        expect(axios.delete).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Object)
        );
    });

    test('should handle errors gracefully', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.delete.mockRejectedValue(new Error(errorMessage));

        await expect(deleteDay(mockDayId)).rejects.toThrow(errorMessage);
        expect(axios.delete).toHaveBeenCalledTimes(1);
    });
});