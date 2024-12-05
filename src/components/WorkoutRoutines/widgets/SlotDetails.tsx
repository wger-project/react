import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from '@mui/icons-material/EditOff';
import { Alert, Box, IconButton, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
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

const configTypes = ["weight", "max-weight", "reps", "max-reps", "sets", "rest", "max-rest", "rir"] as const;
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

    return (<>
        {props.slot.configs.length === 0 && (
            <Alert severity="warning">This set has no exercises yet.</Alert>
        )}

        {props.slot.configs.map((slotEntry: SlotEntry) => (
            <SlotEntryDetails
                key={slotEntry.id}
                slotEntry={slotEntry}
                routineId={props.routineId}
                simpleMode={props.simpleMode}
            />
        ))}
    </>);
};

export const SlotEntryDetails = (props: { slotEntry: SlotEntry, routineId: number, simpleMode: boolean }) => {
    const { i18n } = useTranslation();

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

        editSlotEntryQuery.mutate({ id: props.slotEntry.id, exercise: searchResponse.data.base_id });
        setEditExercise(false);
    };

    let language = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }

    return (
        (<React.Fragment>
            <Grid container spacing={1}>
                <Grid size={{ xs: 3, sm: 1 }}>
                    {/*<IconButton size={"small"} onClick={toggleEditExercise} disabled={true}>*/}
                    {/*    <DragHandle />*/}
                    {/*</IconButton>*/}
                    <IconButton size={"small"} onClick={toggleEditExercise} disabled={isPending}>
                        {editExercise ? <EditOffIcon /> : <EditIcon />}
                    </IconButton>
                    <IconButton
                        size={"small"}
                        onClick={() => deleteSlotEntryQuery.mutate(props.slotEntry.id)}
                        disabled={isPending}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>

                <Grid size={{ xs: 9, sm: 3 }}>
                    <Typography variant={"h6"}>
                        {props.slotEntry.exercise?.getTranslation(language).name}
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

                {/*<SlotConfigForm routineId={props.routineId} slotConfig={props.slotConfig} />*/}


                {props.simpleMode
                    ? <React.Fragment>
                        <Grid
                            key={`sets-config-${props.slotEntry.id}`}
                            size={{ xs: 12, sm: 2, }}>
                            {getConfigComponent('sets', props.slotEntry.nrOfSetsConfigs, props.routineId, props.slotEntry.id)}
                        </Grid>
                        <Grid
                            key={`weight-config-${props.slotEntry.id}`}
                            size={{ xs: 12, sm: 3 }}>
                            {getConfigComponent('weight', props.slotEntry.weightConfigs, props.routineId, props.slotEntry.id)}
                        </Grid>
                        <Grid
                            key={`reps-config-${props.slotEntry.id}`}
                            size={{ xs: 12, sm: 3 }}>
                            {getConfigComponent('reps', props.slotEntry.repsConfigs, props.routineId, props.slotEntry.id)}
                        </Grid>
                    </React.Fragment>

                    // Show all config details in advanced mode, also in a grid
                    : <React.Fragment>
                        <Grid
                            key={`slot-config-type-${props.slotEntry.id}`}
                            size={{ xs: 6, sm: 2 }}
                        >
                            <SlotEntryTypeField routineId={props.routineId} slotEntry={props.slotEntry} />
                        </Grid>

                        <Grid
                            key={`sets-config-${props.slotEntry.id}`}
                            size={{ xs: 6, sm: 2 }}>
                            {getConfigComponent('sets', props.slotEntry.nrOfSetsConfigs, props.routineId, props.slotEntry.id)}
                        </Grid>

                        <Grid
                            key={`rest-config-${props.slotEntry.id}`}
                            size={{ xs: 6, sm: 1 }}>
                            {getConfigComponent('rest', props.slotEntry.restTimeConfigs, props.routineId, props.slotEntry.id)}
                        </Grid>
                        <Grid
                            key={`max-rest-config-${props.slotEntry.id}`}
                            size={{ xs: 6, sm: 1 }}>
                            {getConfigComponent('max-rest', props.slotEntry.maxRestTimeConfigs, props.routineId, props.slotEntry.id)}
                        </Grid>
                        <Grid
                            key={`rir-config-${props.slotEntry.id}`}
                            size={{ xs: 12, sm: 2 }}>
                            <ConfigDetailsRiRField
                                routineId={props.routineId}
                                config={props.slotEntry.rirConfigs.length > 0 ? props.slotEntry.rirConfigs[0] : undefined}
                                slotEntryId={props.slotEntry.id}
                            />
                        </Grid>


                        <Grid size={{ xs: 12, sm: 4 }} />


                        <Grid
                            key={`slot-config-rep-unit-${props.slotEntry.id}`}
                            size={{ xs: 12, sm: 2 }}>
                            <SlotEntryRepetitionUnitField slotEntry={props.slotEntry} routineId={props.routineId} />
                        </Grid>
                        <Grid
                            key={`reps-config-${props.slotEntry.id}`}
                            size={{ xs: 6, sm: 1 }}>
                            {getConfigComponent('reps', props.slotEntry.repsConfigs, props.routineId, props.slotEntry.id)}
                        </Grid>
                        <Grid
                            key={`max-reps-config-${props.slotEntry.id}`}
                            size={{ xs: 6, sm: 1 }}>
                            {getConfigComponent('max-reps', props.slotEntry.maxRepsConfigs, props.routineId, props.slotEntry.id)}
                        </Grid>

                        <Grid
                            key={`slot-config-weight-unit-${props.slotEntry.id}`}
                            size={{ xs: 12, sm: 2 }}>
                            <SlotEntryWeightUnitField slotEntry={props.slotEntry} routineId={props.routineId} />
                        </Grid>
                        <Grid
                            key={`weight-config-${props.slotEntry.id}`}
                            size={{ xs: 6, sm: 1 }}>
                            {getConfigComponent('weight', props.slotEntry.weightConfigs, props.routineId, props.slotEntry.id)}
                        </Grid>
                        <Grid
                            key={`max-weight-config-${props.slotEntry.id}`}
                            size={{ xs: 6, sm: 1 }}>
                            {getConfigComponent('max-weight', props.slotEntry.maxWeightConfigs, props.routineId, props.slotEntry.id)}
                        </Grid>


                    </React.Fragment>
                }
            </Grid>
            <Box height={10} />
        </React.Fragment>)
    );
};