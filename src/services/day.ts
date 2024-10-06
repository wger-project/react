import axios from 'axios';
import { Day, DayAdapter } from "components/WorkoutRoutines/models/Day";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export interface AddDayParams {
    routine: number;
    name?: string;
    description?: string;
    next_day_id?: number;
}

export interface EditDayParams extends AddDayParams {
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


