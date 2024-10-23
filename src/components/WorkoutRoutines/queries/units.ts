import { useQuery } from "@tanstack/react-query";
import { getRoutineRepUnits, getRoutineWeightUnits } from "services";
import { QueryKey, } from "utils/consts";


export const useFetchRoutineWeighUnitsQuery = () => useQuery([QueryKey.ROUTINE_WEIGHT_UNITS], getRoutineWeightUnits);

export const useFetchRoutineRepUnitsQuery = () => useQuery([QueryKey.ROUTINE_REP_UNITS], getRoutineRepUnits);

