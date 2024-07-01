import { Autocomplete, TextField } from "@mui/material";
import { useMusclesQuery } from "components/Exercises/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { editExercise } from "services";

export function EditExerciseMuscle(props: {
    exerciseId: number,
    value: number[],
    setValue: React.Dispatch<React.SetStateAction<number[]>>,
    blocked: number[],
    isMain: boolean
}) {
    const { t } = useTranslation();
    const musclesQuery = useMusclesQuery();

    const handleOnChange = async (newValue: number[]) => {
        props.setValue(newValue);
        // eslint-disable-next-line camelcase
        await editExercise(props.exerciseId, props.isMain ? { muscles: newValue } : { muscles_secondary: newValue });
    };

    return musclesQuery.isSuccess
        ? <Autocomplete
            multiple
            options={musclesQuery.data!.map(m => m.id)}
            getOptionDisabled={(option) => props.blocked.includes(option)}
            getOptionLabel={option => musclesQuery.data!.find(m => m.id === option)!.getName(t)}
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