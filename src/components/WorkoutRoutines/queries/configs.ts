import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    AddBaseConfigParams,
    addMaxRepsConfig,
    addMaxRestConfig,
    addMaxWeightConfig,
    addNrOfSetsConfig,
    addRepsConfig,
    addRestConfig,
    addRirConfig,
    addWeightConfig,
    deleteMaxRepsConfig,
    deleteMaxRestConfig,
    deleteMaxWeightConfig,
    deleteNrOfSetsConfig,
    deleteRepsConfig,
    deleteRestConfig,
    deleteRirConfig,
    deleteWeightConfig,
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


/*
 * Weight config
 */
export const useEditWeightConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editWeightConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
                queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
            }
        )
    });
};
export const useAddWeightConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddBaseConfigParams) => addWeightConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useDeleteWeightConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteWeightConfig(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};


/*
 * Max Weight config
 */
export const useEditMaxWeightConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editMaxWeightConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useAddMaxWeightConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddBaseConfigParams) => addMaxWeightConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useDeleteMaxWeightConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMaxWeightConfig(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};

/*
 * Reps config
 */
export const useEditRepsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editRepsConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useAddRepsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddBaseConfigParams) => addRepsConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useDeleteRepsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteRepsConfig(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};

/*
 * Max Reps config
 */
export const useEditMaxRepsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editMaxRepsConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useAddMaxRepsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddBaseConfigParams) => addMaxRepsConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useDeleteMaxRepsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMaxRepsConfig(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};

/*
 * Nr of Sets config
 */
export const useEditNrOfSetsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editNrOfSetsConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useAddNrOfSetsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddBaseConfigParams) => addNrOfSetsConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useDeleteNrOfSetsConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteNrOfSetsConfig(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};

/*
 * RiR
 */
export const useEditRiRConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editRirConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useAddRiRConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddBaseConfigParams) => addRirConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useDeleteRiRConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteRirConfig(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};

/*
 * Rest time config
 */
export const useEditRestConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editRestConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useAddRestConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddBaseConfigParams) => addRestConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useDeleteRestConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteRestConfig(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};

/*
 * Max Rest time config
 */
export const useEditMaxRestConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditBaseConfigParams) => editMaxRestConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useAddMaxRestConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddBaseConfigParams) => addMaxRestConfig(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};
export const useDeleteMaxRestConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMaxRestConfig(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_DETAIL, routineId]
        })
    });
};

