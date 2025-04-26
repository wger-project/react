import axios from "axios";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { addSlot, deleteSlot, editSlot, editSlotOrder, EditSlotOrderParam } from "services/slot";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";

jest.mock('axios');

describe("Slot service tests", () => {
    const slotData = {
        day: 1,
        order: 1,
        comment: 'test',
        config: null
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Creates a new Slot', async () => {
        (axios.post as jest.Mock).mockImplementation(() => Promise.resolve({ data: { id: 123, ...slotData } }));

        const result = await addSlot(slotData);

        expect(axios.post).toHaveBeenCalledWith(
            makeUrl(ApiPath.SLOT),
            slotData,
            { headers: makeHeader() }
        );
        expect(result).toStrictEqual(new Slot({ id: 123, dayId: 1, order: 1, comment: 'test', config: null }));
    });

    test('Update a Slot', async () => {
        (axios.patch as jest.Mock).mockImplementation(() => Promise.resolve({
            data: {
                id: 123, ...slotData,
                comment: 'foo'
            }
        }));

        const result = await editSlot({ id: 123, comment: 'foo' });

        expect(axios.patch).toHaveBeenCalledWith(
            makeUrl(ApiPath.SLOT, { id: 123 }),
            { id: 123, comment: 'foo' },
            { headers: makeHeader() }
        );
        expect(result).toStrictEqual(new Slot({ id: 123, dayId: 1, order: 1, comment: 'foo', config: null }));
    });

    test('Updates the order of Slots', async () => {
        (axios.patch as jest.Mock).mockImplementation(() => Promise.resolve({ data: {} }));
        const data: EditSlotOrderParam[] = [
            { id: 10, order: 2 },
            { id: 41, order: 1 }
        ];

        await editSlotOrder(data);

        expect(axios.patch).toHaveBeenCalledTimes(2);
        expect(axios.patch).toHaveBeenNthCalledWith(
            1,
            makeUrl(ApiPath.SLOT, { id: 10 }),
            { order: 2 },
            { headers: makeHeader() }
        );
        expect(axios.patch).toHaveBeenNthCalledWith(
            2,
            makeUrl(ApiPath.SLOT, { id: 41 }),
            { order: 1 },
            { headers: makeHeader() }
        );
    });

    test('Delete a Slot', async () => {
        (axios.delete as jest.Mock).mockImplementation(() => Promise.resolve({}));

        await deleteSlot(1);

        expect(axios.delete).toHaveBeenCalledWith(
            makeUrl(ApiPath.SLOT, { id: 1 }),
            { headers: makeHeader() }
        );
    });
});