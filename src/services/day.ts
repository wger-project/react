import axios from 'axios';
import { Day, DayAdapter } from "components/WorkoutRoutines/models/Day";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export interface AddDayParams {
    routine: number;
    name: string;
    description: string;
    order?: number;
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


