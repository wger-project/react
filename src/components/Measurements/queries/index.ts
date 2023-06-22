import { useQuery } from "@tanstack/react-query";
import { QUERY_MEASUREMENTS, QUERY_MEASUREMENTS_CATEGORIES, } from "utils/consts";
import { getMeasurementCategories, getMeasurementEntries } from "services/measurements";


export function useMeasurementsCategoryQuery() {
    return useQuery([QUERY_MEASUREMENTS_CATEGORIES], getMeasurementCategories);
}

export function useMeasurementsQuery(id: number) {
    return useQuery([QUERY_MEASUREMENTS, id],
        () => getMeasurementEntries(id)
    );
}