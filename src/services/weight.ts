import axios from 'axios';
import { WeightEntry } from "components/BodyWeight/model";
import { ApiBodyWeightType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { FilterType } from '../components/BodyWeight/widgets/FilterButtons';
import { calculatePastDate } from '../utils/date';
import { ResponseType } from "./responseType";

export const WEIGHT_PATH = 'weightentry';

/*
 * Fetch weight entries based on filter value
 */
export const getWeights = async (filter: FilterType = ''): Promise<WeightEntry[]> => {

    // eslint-disable-next-line camelcase
    const date__gte = calculatePastDate(filter);

    // eslint-disable-next-line camelcase
    const url = makeUrl(WEIGHT_PATH, { query: { ordering: '-date', limit: 900, ...(date__gte && { date__gte }) } });
    const { data: receivedWeights } = await axios.get<ResponseType<ApiBodyWeightType>>(url, {
        headers: makeHeader(),
    });
    return receivedWeights.results.map(weight => WeightEntry.fromJson(weight));
};

/*
 * Delete a weight entry
 */
export const deleteWeight = async (id: number): Promise<number> => {
    const response = await axios.delete<number>(makeUrl(WEIGHT_PATH, { id: id }), {
        headers: makeHeader(),
    });

    return response.status;
};

/*
 * Update a weight entry
 */
export const updateWeight = async (entry: WeightEntry): Promise<WeightEntry> => {
    const response = await axios.patch(makeUrl(WEIGHT_PATH, { id: entry.id }), entry.toJson(), {
        headers: makeHeader(),
    });

    return WeightEntry.fromJson(response);
};

/*
 * Add a new weight entry
 */
export const createWeight = async (entry: WeightEntry): Promise<WeightEntry> => {
    const response = await axios.post(makeUrl(WEIGHT_PATH,), entry.toJson(), {
        headers: makeHeader(),
    });

    return WeightEntry.fromJson(response.data);
};
