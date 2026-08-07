import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBodyWeightCategory, getWeights } from "@/components/Measurements/api/bodyWeight";
import { useProfileQuery } from "@/components/User";
import { QueryKey, } from "@/core/lib/consts";
import { WeightUnit } from "@/core/lib/weightUnit";

/**
 * Cache key of the official body weight category, standing in for its id.
 *
 * Body weight rows are measurement rows, so the queries below live under the
 * measurement keys: an entry written through the measurement mutations
 * invalidates the weight views and the other way round. The id itself cannot
 * be the key, because it is only known once the category query resolved, and a
 * query key has to exist before that.
 */
const OFFICIAL_BODY_WEIGHT = 'official-body-weight';

/*
 * The official body weight category basically never changes, resolve it once
 * per session (ensureQueryData returns the cached result on later calls)
 */
const bodyWeightCategoryQueryOptions = {
    queryKey: [QueryKey.MEASUREMENTS_CATEGORIES, OFFICIAL_BODY_WEIGHT],
    queryFn: () => getBodyWeightCategory(),
};

export function useBodyWeightCategoryQuery() {
    return useQuery(bodyWeightCategoryQueryOptions);
}

/*
 * The unit weight values are displayed in: the user's profile weight unit.
 * Entries keep the unit they were entered in, only the presentation converts.
 */
export function useDisplayWeightUnit(): WeightUnit {
    const profileQuery = useProfileQuery();

    return profileQuery.data?.useMetric === false ? 'lb' : 'kg';
}

/**
 * Body weight entries, newest first.
 *
 * The filterset is the one the measurement queries take (`entryFilterFor` for
 * a chart range, explicit date bounds otherwise), so a screen fetches what it
 * shows instead of the whole history.
 *
 * Writes go through the measurement entry mutations, which invalidate this key
 * along with every other view of the same rows.
 */
export function useBodyWeightQuery(filtersetQueryEntries: object = {}) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: [QueryKey.MEASUREMENTS, OFFICIAL_BODY_WEIGHT, filtersetQueryEntries],
        queryFn: async () => {
            const category = await queryClient.ensureQueryData(bodyWeightCategoryQueryOptions);
            return getWeights(category, filtersetQueryEntries);
        },
        // Widening the range refetches, and the chart would otherwise drop
        // back to the loading placeholder while the longer history arrives
        placeholderData: keepPreviousData,
    });
}
