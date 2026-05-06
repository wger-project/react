import { SlotEntry, SlotEntryType } from "@/components/Routines/models/SlotEntry";
import {
    useEditSlotEntryQuery,
    useFetchRoutineRepUnitsQuery,
    useFetchRoutineWeighUnitsQuery
} from "@/components/Routines/queries";
import { useEditProfileQuery, useProfileQuery } from "@/components/User";
import { DEBOUNCE_ROUTINE_FORMS } from "@/core/lib/consts";
import { LoadingProgressIcon } from "@/core/ui/LoadingWidget/LoadingWidget";
import { MenuItem, TextField } from "@mui/material";
import debounce from "lodash/debounce";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const SlotEntryTypeField = (props: { slotEntry: SlotEntry, routineId: number }) => {
    const { t } = useTranslation();
    const editQuery = useEditSlotEntryQuery(props.routineId);

    const options = [
        {
            value: 'normal',
            label: t('routines.set.normalSet'),
        },
        {
            value: 'warmup',
            label: t('routines.set.warmup'),
        },
        {
            value: 'dropset',
            label: t('routines.set.dropSet'),
        },
        {
            value: 'myo',
            label: t('routines.set.myo'),
        },
        {
            value: 'partial',
            label: t('routines.set.partial'),
        },
        {
            value: 'forced',
            label: t('routines.set.forced'),
        },
        {
            value: 'tut',
            label: t('routines.set.tut'),
        },
        {
            value: 'iso',
            label: t('routines.set.iso'),
        },
        {
            value: 'jump',
            label: t('routines.set.jump'),
        }
    ] as const;

    const handleOnChange = (newValue: string) => {
        editQuery.mutate(SlotEntry.clone(props.slotEntry, { type: newValue as SlotEntryType }));
    };


    return <>
        <TextField
            fullWidth
            select
            label={t('routines.set.type')}
            variant="standard"
            value={props.slotEntry.type}
            disabled={editQuery.isPending}
            onChange={e => handleOnChange(e.target.value)}
        >
            {options!.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.value.toUpperCase()} - {option.label}
                </MenuItem>
            ))}
        </TextField>
    </>;
};


export const SlotEntryRepetitionUnitField = (props: { slotEntry: SlotEntry, routineId: number }) => {
    const { t } = useTranslation();
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
        editSlotEntryQuery.mutate(SlotEntry.clone(props.slotEntry, { repetitionUnitId: parseInt(newValue) }));
    };


    return <>
        <TextField
            fullWidth
            select
            label={t('unit')}
            variant="standard"
            value={props.slotEntry.repetitionUnitId}
            disabled={editSlotEntryQuery.isPending}
            onChange={e => handleOnChange(e.target.value)}
        >
            {options!.map((option) => (
                <MenuItem key={option.value} value={option.value ?? ''}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    </>;
};

export const SlotEntryWeightUnitField = (props: { slotEntry: SlotEntry, routineId: number }) => {
    const { t } = useTranslation();
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
        editSlotEntryQuery.mutate(SlotEntry.clone(props.slotEntry, { weightUnitId: parseInt(newValue) }));
    };

    return <>
        <TextField
            fullWidth
            select
            label={t('unit')}
            variant="standard"
            value={props.slotEntry.weightUnitId}
            disabled={editSlotEntryQuery.isPending}
            onChange={e => handleOnChange(e.target.value)}
        >
            {options!.map((option) => (
                <MenuItem key={option.value} value={option.value ?? ''}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    </>;
};

type BaseSlotEntryRoundingFieldProps = {
    initialValue: number | null;
    rounding: 'weight' | 'reps';
    routineId: number;
};

type SlotEntryRoundingFieldProps =
    | (BaseSlotEntryRoundingFieldProps & { editProfile: true })
    | (BaseSlotEntryRoundingFieldProps & { editProfile: false; slotEntry: SlotEntry });

export const SlotEntryRoundingField = (props: SlotEntryRoundingFieldProps) => {
    const { t } = useTranslation();

    const editSlotEntryQuery = useEditSlotEntryQuery(props.routineId);
    const editProfileQuery = useEditProfileQuery();

    const [value, setValue] = useState<string | number | null>(props.initialValue === null ? '' : props.initialValue);

    // Hold the latest save logic in a ref so the debounced wrapper always
    // uses current props/queries instead of values captured on first render.
    const saveRef = useRef<(newValue: string) => void>(() => {
    });
    saveRef.current = (newValue: string) => {
        const parsedValue = isNaN(Number(newValue)) ? null : parseFloat(newValue);

        const data = props.rounding === 'weight'
            ? { weightRounding: parsedValue }
            : { repetitionRounding: parsedValue };

        if (props.editProfile) {
            editProfileQuery.mutate(data);
        } else {
            editSlotEntryQuery.mutate(SlotEntry.clone(props.slotEntry, data));
        }
    };

    const debouncedSave = useMemo(
        () => debounce((newValue: string) => saveRef.current(newValue), DEBOUNCE_ROUTINE_FORMS),
        []
    );

    useEffect(() => () => debouncedSave.cancel(), [debouncedSave]);

    const handleOnChange = (newValue: string) => {
        setValue(newValue);
        debouncedSave(newValue);
    };

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