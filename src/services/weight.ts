import axios from 'axios';
import { WeightAdapter, WeightEntry } from "components/BodyWeight/model";
import { ApiBodyWeightType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";
import { FilterType } from '../components/BodyWeight/widgets/FilterButtons';
import { calculatePastDate } from '../utils/date';

export const WEIGHT_PATH = 'weightentry';

/*
 * Fetch weight entries based on filter value
 */
export const getWeights = async (filter: FilterType = ''): Promise<WeightEntry[]> => {

    const date__gte = calculatePastDate(filter);
    
    const url = makeUrl(WEIGHT_PATH, { query: { ordering: '-date', limit: 900, ...(date__gte && { date__gte }) } });
    const { data: receivedWeights } = await axios.get<ResponseType<ApiBodyWeightType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new WeightAdapter();
    return receivedWeights.results.map(weight => adapter.fromJson(weight));
};

/*
 * Delete a weight entry
 */
export const deleteWeight = async (id: number): Promise<number> => {
    const response = await axios.delete<Number>(makeUrl(WEIGHT_PATH, { id: id }), {
        headers: makeHeader(),
    });

    return response.status;
};

/*
 * Update a weight entry
 */
export const updateWeight = async (entry: WeightEntry): Promise<WeightEntry> => {
    const adapter = new WeightAdapter();
    const response = await axios.patch(makeUrl(WEIGHT_PATH, { id: entry.id }), adapter.toJson(entry), {
        headers: makeHeader(),
    });

    return adapter.fromJson(response);
};

/*
 * Add a new weight entry
 */
export const createWeight = async (entry: WeightEntry): Promise<WeightEntry> => {
    const adapter = new WeightAdapter();
    const response = await axios.post(makeUrl(WEIGHT_PATH,), adapter.toJson(entry), {
        headers: makeHeader(),
    });

    return adapter.fromJson(response.data);
};
