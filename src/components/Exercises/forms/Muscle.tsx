import { Autocomplete, TextField } from "@mui/material";
import { useEditExerciseQuery, useMusclesQuery } from "@/components/Exercises/queries";
import React from "react";
import { useTranslation } from "react-i18next";

export function EditExerciseMuscle(props: {
    exerciseId: number,
    value: number[],
    setValue: React.Dispatch<React.SetStateAction<number[]>>,
    blocked: number[],
    isMain: boolean
}) {
    const { t } = useTranslation();
    const musclesQuery = useMusclesQuery();
    const editMutation = useEditExerciseQuery();

    const handleOnChange = async (newValue: number[]) => {
        props.setValue(newValue);
        await editMutation.mutateAsync({
            id: props.exerciseId,
            // eslint-disable-next-line camelcase
            data: props.isMain ? { muscles: newValue } : { muscles_secondary: newValue },
        });
    };

    return musclesQuery.isSuccess
        ? <Autocomplete
            multiple
            options={musclesQuery.data!.map(m => m.id)}
            getOptionDisabled={(option) => props.blocked.includes(option)}
            getOptionLabel={option => musclesQuery.data!.find(m => m.id === option)!.getName()}
            value={props.value}
            onChange={(event, newValue) => handleOnChange(newValue)}
            renderInput={params => (
                <TextField
                    {...params}
                    variant="standard"
                    label={t(props.isMain ? "exercises.muscles" : "exercises.secondaryMuscles")}
                    value={props.value}
                />
            )}
        />
        : null;
}