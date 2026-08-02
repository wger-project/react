import {
    API_MEASUREMENTS_CATEGORY_PATH,
    getMeasurementEntries,
    MeasurementCategory,
    MeasurementEntry,
    METRIC_TYPE_BODY_WEIGHT
} from "@/components/Measurements";
import { ResponseType } from "@/core/api/responseType";
import { makeHeader, makeUrl } from "@/core/lib/url";
import { ApiMeasurementCategoryType } from '@/types';
import axios from 'axios';

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
 * Fetch the body weight entries the filter selects, newest first
 *
 * Body weight is measurement data, so this reads through the measurement
 * loader: it collects every page instead of stopping after the first, which is
 * what a history fed by the health sync (~365 entries a year) needs.
 */
export const getWeights = async (
    category: MeasurementCategory,
    filtersetQueryEntries: object = {},
): Promise<MeasurementEntry[]> => getMeasurementEntries(category.id!, {
    // Consumers read the newest entry off the front (BMI, dashboard)
    ordering: '-date',
    ...filtersetQueryEntries,
});

// Writing a body weight entry is writing a measurement entry: the create,
// update and delete calls of `api/measurements.ts` are used unchanged, there
// is nothing body-weight-specific about them.
