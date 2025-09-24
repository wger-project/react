import axios from "axios";
import { Day } from "components/WorkoutRoutines/models/Day";
import { addDay, deleteDay, editDay, editDayOrder } from "services";

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('editDay', () => {

    const mockDayData = {
        id: 1,
        routine: 1,
        name: 'Test Day',
        description: 'A test day',
        order: 1,
        // eslint-disable-next-line camelcase
        is_rest: false,
    };

    const testDay = Day.fromJson(mockDayData);
    testDay.name = 'Test Day';

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    test('should update a day and return the updated day', async () => {
        mockedAxios.patch.mockResolvedValue({ data: mockDayData });

        const updatedDay = await editDay(testDay);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        expect(updatedDay).toEqual(Day.fromJson(mockDayData));
    });

    test('should handle errors gracefully', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.patch.mockRejectedValue(new Error(errorMessage));

        await expect(editDay(testDay)).rejects.toThrow(errorMessage);
        expect(axios.patch).toHaveBeenCalledTimes(1);
    });
});


describe('editDayOrder', () => {
    const testDayOrders = [
        new Day({ id: 1, routineId: 123, name: '', order: 3 }),
        new Day({ id: 2, routineId: 123, name: '', order: 1 }),
        new Day({ id: 3, routineId: 123, name: '', order: 2 }),
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should update the order of multiple days', async () => {
        mockedAxios.patch.mockResolvedValue({ status: 200 });

        await editDayOrder(testDayOrders);

        expect(axios.patch).toHaveBeenCalledTimes(testDayOrders.length);
        testDayOrders.forEach(({ order, id }) => {
            expect(axios.patch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    order: order,
                }),
                expect.any(Object)
            );
        });
    });

    test('should handle errors gracefully', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.patch.mockRejectedValueOnce(new Error(errorMessage));

        await expect(editDayOrder(testDayOrders)).rejects.toThrow(errorMessage);
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
        // eslint-disable-next-line camelcase
        is_rest: false,
        // eslint-disable-next-line camelcase
        need_logs_to_advance: false,
    };

    const testDay = new Day({
        routineId: 1,
        name: 'Test Day',
        description: 'A test day',
        order: 1,
        isRest: false,
        needLogsToAdvance: false,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should create a new day and return the created day', async () => {
        mockedAxios.post.mockResolvedValue({ data: mockDayData });

        const newDay = await addDay(testDay);

        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(newDay).toEqual(Day.fromJson(mockDayData));
    });

    test('should handle errors gracefully', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.post.mockRejectedValue(new Error(errorMessage));

        await expect(addDay(testDay)).rejects.toThrow(errorMessage);
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