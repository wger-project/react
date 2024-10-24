import axios from 'axios';
import { Day, DayAdapter } from "components/WorkoutRoutines/models/Day";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export interface AddDayParams {
    routine: number;
    name: string;
    description?: string;
    order: number;
    is_rest: boolean;
}

export interface EditDayParams extends Partial<AddDayParams> {
    id: number,
}

/*
 * Update a day
 */
export const editDay = async (data: EditDayParams): Promise<Day> => {
    const response = await axios.patch(
        makeUrl(ApiPath.DAY, { id: data.id }),
        data,
        { headers: makeHeader() }
    );

    const adapter = new DayAdapter();
    return adapter.fromJson(response.data);
};

/*
 * Creates a new day
 */
export const addDay = async (data: AddDayParams): Promise<Day> => {
    const response = await axios.post(
        makeUrl(ApiPath.DAY),
        data,
        { headers: makeHeader() }
    );

    return new DayAdapter().fromJson(response.data);
};

/*
 * Deletes an existing day
 */
export const deleteDay = async (id: number): Promise<void> => {
    const response = await axios.delete(
        makeUrl(ApiPath.DAY, { id: id }),
        { headers: makeHeader() }
    );
};


