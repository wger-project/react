import { useQuery } from "@tanstack/react-query";
import { getRoutineRepUnits, getRoutineWeightUnits } from "services";
import { QueryKey, } from "utils/consts";


export const useFetchRoutineWeighUnitsQuery = () => useQuery({
    queryKey: [QueryKey.ROUTINE_WEIGHT_UNITS],
    queryFn: getRoutineWeightUnits
});

export const useFetchRoutineRepUnitsQuery = () => useQuery({
    queryKey: [QueryKey.ROUTINE_REP_UNITS],
    queryFn: getRoutineRepUnits
});

