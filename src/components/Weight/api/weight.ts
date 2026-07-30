import {
    API_MEASUREMENTS_CATEGORY_PATH,
    API_MEASUREMENTS_ENTRY_PATH,
    MeasurementCategory,
    METRIC_TYPE_BODY_WEIGHT
} from "@/components/Measurements";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import { ResponseType } from "@/core/api/responseType";
import { calculatePastDate } from '@/core/lib/date';
import { WeightUnit } from "@/core/lib/weightUnit";
import { makeHeader, makeUrl } from "@/core/lib/url";
import { ApiMeasurementCategoryType, ApiMeasurementEntryType } from '@/types';
import axios from 'axios';
import { FilterType } from '../widgets/FilterButtons';

/*
 * Fetch the user's official body weight category
 *
 * The server guarantees that every user has exactly one
 */
export const getBodyWeightCategory = async (): Promise<MeasurementCategory> => {
    const url = makeUrl(API_MEASUREMENTS_CATEGORY_PATH, {
        query: { metric_type: METRIC_TYPE_BODY_WEIGHT, is_official: 'true' }
    });
    const { data } = await axios.get<ResponseType<ApiMeasurementCategoryType>>(url, {
        headers: makeHeader(),
    });

    // The server guarantees the category exists; still fail with a clear
    // message instead of a TypeError should that ever break
    if (data.results.length === 0) {
        throw new Error('No official body weight category found');
    }

    return MeasurementCategory.fromJson(data.results[0]);
};

/*
 * Fetch weight entries based on filter value
 *
 * Entries without their own unit in extra_data fall back to the category unit
 */
export const getWeights = async (category: MeasurementCategory, filter: FilterType = ''): Promise<WeightEntry[]> => {
    const date__gte = calculatePastDate(filter);

    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, {
        query: {
            category: category.id!,
            ordering: '-date',
            limit: 900,
            ...(date__gte && { date__gte })
        }
    });
    const { data } = await axios.get<ResponseType<ApiMeasurementEntryType>>(url, {
        headers: makeHeader(),
    });

    const fallbackUnit: WeightUnit = category.unit === 'lb' ? 'lb' : 'kg';
    return data.results.map(entry => WeightEntry.fromJson(entry, fallbackUnit));
};

/*
 * Delete a weight entry
 */
export const deleteWeight = async (id: string): Promise<number> => {
    const response = await axios.delete<number>(makeUrl(API_MEASUREMENTS_ENTRY_PATH, { id: id }), {
        headers: makeHeader(),
    });

    return response.status;
};

/*
 * Update a weight entry
 */
export const updateWeight = async (entry: WeightEntry): Promise<WeightEntry> => {
    const response = await axios.patch(makeUrl(API_MEASUREMENTS_ENTRY_PATH, { id: entry.id }), entry.toJson(), {
        headers: makeHeader(),
    });

    return WeightEntry.fromJson(response.data, entry.unit);
};

/*
 * Add a new weight entry to the official body weight category
 */
export const createWeight = async (entry: WeightEntry, categoryId: string): Promise<WeightEntry> => {
    const response = await axios.post(
        makeUrl(API_MEASUREMENTS_ENTRY_PATH),
        { ...entry.toJson(), category: categoryId },
        { headers: makeHeader() },
    );

    return WeightEntry.fromJson(response.data, entry.unit);
};
