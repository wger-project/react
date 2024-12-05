import { MenuItem, TextField } from "@mui/material";
import { LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import { useProfileQuery } from "components/User/queries/profile";
import { SlotEntry, SlotEntryType } from "components/WorkoutRoutines/models/SlotEntry";
import {
    useEditSlotEntryQuery,
    useFetchRoutineRepUnitsQuery,
    useFetchRoutineWeighUnitsQuery
} from "components/WorkoutRoutines/queries";
import React from "react";

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
