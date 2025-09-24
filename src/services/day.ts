import axios from 'axios';
import { Day } from "components/WorkoutRoutines/models/Day";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


/*
 * Update a day
 */
export const editDay = async (day: Day): Promise<Day> => {
    const response = await axios.patch(
        makeUrl(ApiPath.DAY, { id: day.id! }),
        day.toJson(),
        { headers: makeHeader() }
    );

    return Day.fromJson(response.data);
};

export const editDayOrder = async (days: Day[]): Promise<void> => {

    for (const day of days) {
        await axios.patch(
            makeUrl(ApiPath.DAY, { id: day.id! }),
            day.toJson(),
            { headers: makeHeader() }
        );
    }
};

/*
 * Creates a new day
 */
export const addDay = async (day: Day): Promise<Day> => {
    const response = await axios.post(
        makeUrl(ApiPath.DAY),
        day.toJson(),
        { headers: makeHeader() }
    );

    return Day.fromJson(response.data);
};

/*
 * Deletes an existing day
 */
export const deleteDay = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.DAY, { id: id }),
        { headers: makeHeader() }
    );
};


