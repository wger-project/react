import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_MEASUREMENTS, QUERY_MEASUREMENTS_CATEGORIES, } from "utils/consts";
import {
    deleteMeasurementEntry,
    editMeasurementEntry,
    getMeasurementCategories,
    getMeasurementCategory
} from "services";
import { editMeasurementParams } from "services/measurements";


export function useMeasurementsCategoryQuery() {
    return useQuery([QUERY_MEASUREMENTS_CATEGORIES], getMeasurementCategories);
}

export function useMeasurementsQuery(id: number) {
    return useQuery([QUERY_MEASUREMENTS, id],
        () => getMeasurementCategory(id)
    );
}

export const useEditMeasurementsQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: editMeasurementParams) => editMeasurementEntry(data),
        onSuccess: () => queryClient.invalidateQueries([QUERY_MEASUREMENTS,])
    });
};

export const useDeleteMeasurementsQuery = (/*id: number*/) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMeasurementEntry(id),
        onSuccess: () => queryClient.invalidateQueries([QUERY_MEASUREMENTS,])
    });
};
