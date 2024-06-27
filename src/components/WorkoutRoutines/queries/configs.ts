import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    EditBaseConfigParams,
    editMaxRepsConfig,
    editMaxRestConfig,
    editMaxWeightConfig,
    editNrOfSetsConfig,
    editRepsConfig,
    editRestConfig,
    editRirConfig,
    editWeightConfig
} from "services/config";
import { QueryKey, } from "utils/consts";


export const useEditWeightConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editWeightConfig(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};

export const useEditMaxWeightConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editMaxWeightConfig(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};

export const useEditRepsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editRepsConfig(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};

export const useEditMaxRepsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editMaxRepsConfig(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};

export const useEditNrOfSetsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editNrOfSetsConfig(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};

export const useEditRiRConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editRirConfig(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};

export const useEditRestConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editRestConfig(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};
export const useEditMaxRestConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editMaxRestConfig(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};


