import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from '@mui/icons-material/EditOff';
import { Alert, AlertTitle, IconButton, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { useLanguageQuery } from "components/Exercises/queries";
import { BaseConfig } from "components/WorkoutRoutines/models/BaseConfig";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { SlotEntry } from "components/WorkoutRoutines/models/SlotEntry";
import { useDeleteSlotEntryQuery, useEditSlotEntryQuery } from "components/WorkoutRoutines/queries";
import {
    ConfigDetailsRiRField,
    SlotBaseConfigValueField
} from "components/WorkoutRoutines/widgets/forms/BaseConfigForm";
import {
    SlotEntryRepetitionUnitField,
    SlotEntryTypeField,
    SlotEntryWeightUnitField
} from "components/WorkoutRoutines/widgets/forms/SlotEntryForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getLanguageByShortName } from "services";
import { ExerciseSearchResponse } from "services/responseType";

/*
 * Converts a number to an alphabetic string, useful for counting
 */
function toAlphabetic(num: number) {
    let result = "";
    while (num > 0) {
        num--; // Adjust for 0-based index
        result = String.fromCharCode(97 + (num % 26)) + result;
        num = Math.floor(num / 26);
    }
    return result;
}

const configTypes = ["weight", "max-weight", "reps", "max-reps", "max-sets", "sets", "rest", "max-rest", "rir"] as const;
type ConfigType = typeof configTypes[number];

const getConfigComponent = (type: ConfigType, configs: BaseConfig[], routineId: number, slotEntryId: number) => {
    return configs.length > 0
        ?
        <SlotBaseConfigValueField
            config={configs[0]}
            type={type}
            routineId={routineId} />

        : <SlotBaseConfigValueField
            type={type}
            routineId={routineId}
            slotEntryId={slotEntryId} />
        ;
};

export const SlotDetails = (props: { slot: Slot, routineId: number, simpleMode: boolean }) => {
    const { t } = useTranslation();

    return (<>
        {props.slot.entries.length === 0 && (
            <Alert severity="warning">
                <AlertTitle>{t('routines.setHasNoExercises')}</AlertTitle>
                {t('nothingHereYetAction')}
            </Alert>
        )}
        {props.slot.entries.map((slotEntry: SlotEntry, index) => (
            <SlotEntryDetails
                key={slotEntry.id}
                slotEntry={slotEntry}
                routineId={props.routineId}
                simpleMode={props.simpleMode}
                index={index}
                total={props.slot.entries.length}
            />
        ))}
    </>);
};

export const SlotEntryDetails = (props: {
    slotEntry: SlotEntry,
    routineId: number,
    simpleMode: boolean,
    index: number,
    total: number
}) => {
    const { t, i18n } = useTranslation();

    const [editExercise, setEditExercise] = useState(false);
    const toggleEditExercise = () => setEditExercise(!editExercise);

    const languageQuery = useLanguageQuery();
    const editSlotEntryQuery = useEditSlotEntryQuery(props.routineId);
    const deleteSlotEntryQuery = useDeleteSlotEntryQuery(props.routineId);

    const isPending = editSlotEntryQuery.isPending || deleteSlotEntryQuery.isPending;

    const handleExerciseChange = (searchResponse: ExerciseSearchResponse | null) => {
        if (searchResponse === null) {
            return;
        }

        editSlotEntryQuery.mutate(SlotEntry.clone(props.slotEntry, { exerciseId: searchResponse.data.base_id }));
        setEditExercise(false);
    };

    let language = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }

    const getForm = () => (props.simpleMode
            ? <React.Fragment>
                <Grid
                    key={`sets-config-${props.slotEntry.id}`}
                    size={{ xs: 12, sm: 2, }}>
                    {getConfigComponent('sets', props.slotEntry.nrOfSetsConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>
                <Grid
                    key={`weight-config-${props.slotEntry.id}`}
                    size={{ xs: 12, sm: 3 }}>
                    {getConfigComponent('weight', props.slotEntry.weightConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>
                <Grid
                    key={`reps-config-${props.slotEntry.id}`}
                    size={{ xs: 12, sm: 3 }}>
                    {getConfigComponent('reps', props.slotEntry.repetitionsConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>
            </React.Fragment>

            // Show all config details in advanced mode, also in a grid
            : <React.Fragment>

                <Grid size={{ xs: 6, sm: 1 }}>
                    {getConfigComponent('sets', props.slotEntry.nrOfSetsConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>
                <Grid size={{ xs: 6, sm: 1 }}>
                    {getConfigComponent('max-sets', props.slotEntry.maxNrOfSetsConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                    <SlotEntryTypeField routineId={props.routineId} slotEntry={props.slotEntry} />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                    <ConfigDetailsRiRField
                        routineId={props.routineId}
                        config={props.slotEntry.rirConfigs.length > 0 ? props.slotEntry.rirConfigs[0] : undefined}
                        slotEntryId={props.slotEntry.id!}
                    />
                </Grid>

                <Grid size={{ xs: 6, sm: 1 }}>
                    {getConfigComponent('rest', props.slotEntry.restTimeConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>
                <Grid size={{ xs: 6, sm: 1 }}>
                    {getConfigComponent('max-rest', props.slotEntry.maxRestTimeConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>


                <Grid size={{ xs: 6, sm: 2 }} offset={{ sm: 4 }}>
                    {getConfigComponent('weight', props.slotEntry.weightConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                    {getConfigComponent('max-weight', props.slotEntry.maxWeightConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <SlotEntryWeightUnitField slotEntry={props.slotEntry} routineId={props.routineId} />
                </Grid>


                <Grid size={{ xs: 6, sm: 2 }} offset={{ sm: 4 }}>
                    {getConfigComponent('reps', props.slotEntry.repetitionsConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                    {getConfigComponent('max-reps', props.slotEntry.maxRepetitionsConfigs, props.routineId, props.slotEntry.id!)}
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <SlotEntryRepetitionUnitField slotEntry={props.slotEntry} routineId={props.routineId} />
                </Grid>

            </React.Fragment>
    );

    const counter = props.total > 1 ? toAlphabetic(props.index + 1) + ') ' : '';

    return (
        (<React.Fragment>
            <Grid container paddingTop={1} spacing={1}>
                <Grid size={{ xs: 3, sm: 1 }} alignContent={"center"}>
                    {/*<IconButton size={"small"} onClick={toggleEditExercise} disabled={true}>*/}
                    {/*    <DragHandle />*/}
                    {/*</IconButton>*/}
                    <IconButton size={"small"} onClick={toggleEditExercise} disabled={isPending}>
                        {editExercise ? <EditOffIcon /> : <EditIcon />}
                    </IconButton>
                    <IconButton
                        size={"small"}
                        onClick={() => deleteSlotEntryQuery.mutate(props.slotEntry.id!)}
                        disabled={isPending}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>

                <Grid size={{ xs: 9, sm: 3 }} alignContent={"center"}>
                    <Typography variant={"body1"}>
                        {counter} {props.slotEntry.exercise?.getTranslation(language).name}
                    </Typography>
                </Grid>

                {editExercise
                    && <React.Fragment>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <NameAutocompleter callback={handleExerciseChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }} />
                    </React.Fragment>
                }

                {props.slotEntry.hasProgressionRules
                    ? <Grid size={8}>
                        <Alert severity="info" variant="standard" sx={{ mt: 2 }}>
                            {t('routines.exerciseHasProgression')}
                        </Alert>
                    </Grid>
                    : getForm()
                }
            </Grid>
        </React.Fragment>)
    );
};