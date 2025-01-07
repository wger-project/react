import { MenuItem, TextField } from "@mui/material";
import { LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import { useEditProfileQuery, useProfileQuery } from "components/User/queries/profile";
import { SlotEntry, SlotEntryType } from "components/WorkoutRoutines/models/SlotEntry";
import {
    useEditSlotEntryQuery,
    useFetchRoutineRepUnitsQuery,
    useFetchRoutineWeighUnitsQuery
} from "components/WorkoutRoutines/queries";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { DEBOUNCE_ROUTINE_FORMS } from "utils/consts";

export const SlotEntryTypeField = (props: { slotEntry: SlotEntry, routineId: number }) => {

    const editQuery = useEditSlotEntryQuery(props.routineId);

    const options = [
        {
            value: 'normal',
            label: 'Normal set',
        },
        {
            value: 'dropset',
            label: 'Drop set',
        },
        {
            value: 'myo',
            label: 'Myo',
        },
        {
            value: 'partial',
            label: 'Partial',
        },
        {
            value: 'forced',
            label: 'Forced',
        },
        {
            value: 'tut',
            label: 'TUT',
        },
        {
            value: 'iso',
            label: 'ISO',
        },
        {
            value: 'jump',
            label: 'Jump'
        }
    ] as const;

    const handleOnChange = (newValue: string) => {
        editQuery.mutate({ id: props.slotEntry.id, type: newValue as SlotEntryType, });
    };

    return <>
        <TextField
            fullWidth
            select
            label="Type"
            variant="standard"
            value={props.slotEntry.type}
            disabled={editQuery.isPending}
            onChange={e => handleOnChange(e.target.value)}
        >
            {options!.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    </>;
};


export const SlotEntryRepetitionUnitField = (props: { slotEntry: SlotEntry, routineId: number }) => {

    const editSlotEntryQuery = useEditSlotEntryQuery(props.routineId);
    const repUnitsQuery = useFetchRoutineRepUnitsQuery();

    if (repUnitsQuery.isLoading) {
        return <LoadingProgressIcon />;
    }

    const options = repUnitsQuery.data?.map((unit) => ({
        value: unit.id,
        label: unit.name,
    }));

    const handleOnChange = (newValue: string) => {
        editSlotEntryQuery.mutate({ id: props.slotEntry.id, repetition_unit: parseInt(newValue), });
    };


    return <>
        <TextField
            fullWidth
            select
            label="Unit"
            variant="standard"
            value={props.slotEntry.repetitionUnitId}
            disabled={editSlotEntryQuery.isPending}
            onChange={e => handleOnChange(e.target.value)}
        >
            {options!.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    </>;
};

export const SlotEntryWeightUnitField = (props: { slotEntry: SlotEntry, routineId: number }) => {

    const editSlotEntryQuery = useEditSlotEntryQuery(props.routineId);
    const weightUnitsQuery = useFetchRoutineWeighUnitsQuery();
    const userProfileQuery = useProfileQuery();


    if (weightUnitsQuery.isLoading || userProfileQuery.isLoading) {
        return <LoadingProgressIcon />;
    }

    const options = weightUnitsQuery.data?.map((unit) => ({
        value: unit.id,
        label: unit.name,
    }));


    const handleOnChange = (newValue: string) => {
        editSlotEntryQuery.mutate({ id: props.slotEntry.id, weight_unit: parseInt(newValue), });
    };

    return <>
        <TextField
            fullWidth
            select
            label="Unit"
            variant="standard"
            value={props.slotEntry.weightUnitId}
            disabled={editSlotEntryQuery.isPending}
            onChange={e => handleOnChange(e.target.value)}
        >
            {options!.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    </>;
};


function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

type BaseSlotEntryRoundingFieldProps = {
    initialValue: number | null;
    rounding: 'weight' | 'reps';
    routineId: number;
};

type SlotEntryRoundingFieldProps =
    | (BaseSlotEntryRoundingFieldProps & { editProfile: true })
    | (BaseSlotEntryRoundingFieldProps & { editProfile: false; entryId: number });

export const SlotEntryRoundingField = (props: SlotEntryRoundingFieldProps) => {
    const { t } = useTranslation();
    const editSlotEntryQuery = useEditSlotEntryQuery(props.routineId);
    const editProfileQuery = useEditProfileQuery();

    const [value, setValue] = useState<string | number | null>(props.initialValue === null ? '' : props.initialValue);

    const debouncedSave = useCallback(
        debounce((newValue: string) => {
            let parsedValue: number | null = parseFloat(newValue);
            if (Number.isNaN(parsedValue)) {
                parsedValue = null;
            }

            const data = props.rounding === 'weight' ? { weight_rounding: parsedValue } : { reps_rounding: parsedValue };
            if (props.editProfile) {
                editProfileQuery.mutate(data);
            } else {
                editSlotEntryQuery.mutate({ id: props.entryId, ...data });
            }
        }, DEBOUNCE_ROUTINE_FORMS),
        []
    );

    const handleOnChange = (newValue: string) => {
        setValue(newValue);
        debouncedSave(newValue);
    };

    const type = props.rounding === 'weight' ? t('weight') : t('routines.reps');

    return (
        <TextField
            fullWidth
            label={props.rounding === 'weight' ? t('weight') : t('routines.reps')}
            variant="standard"
            value={value}
            disabled={editSlotEntryQuery.isPending || editProfileQuery.isPending}
            onChange={e => handleOnChange(e.target.value)}
        />
    );
};