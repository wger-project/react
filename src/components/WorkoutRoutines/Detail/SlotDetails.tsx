import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from '@mui/icons-material/EditOff';
import { Alert, Box, Grid, IconButton, Typography } from "@mui/material";
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { useLanguageQuery } from "components/Exercises/queries";
import { BaseConfig } from "components/WorkoutRoutines/models/BaseConfig";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { SlotConfig } from "components/WorkoutRoutines/models/SlotConfig";
import { useDeleteSlotConfigQuery, useEditSlotConfigQuery } from "components/WorkoutRoutines/queries";
import { SlotBaseConfigValueField } from "components/WorkoutRoutines/widgets/forms/BaseConfigForm";
import {
    SlotConfigRepetitionUnitField,
    SlotConfigTypeField,
    SlotConfigWeightUnitField
} from "components/WorkoutRoutines/widgets/forms/SlotConfigForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getLanguageByShortName } from "services";
import { ExerciseSearchResponse } from "services/responseType";

const configTypes = ["weight", "max-weight", "reps", "max-reps", "sets", "rest", "max-rest", "rir"] as const;
type ConfigType = typeof configTypes[number];

const getConfigComponent = (type: ConfigType, configs: BaseConfig[], routineId: number, slotConfigId: number) => {
    return configs.length > 0
        ?
        <SlotBaseConfigValueField
            config={configs[0]}
            type={type}
            routineId={routineId} />

        : <SlotBaseConfigValueField
            type={type}
            routineId={routineId}
            slotConfigId={slotConfigId} />
        ;
};

export const SlotEntryDetails = (props: { slot: Slot, routineId: number, simpleMode: boolean }) => {

    return (
        <>
            {props.slot.configs.length === 0 && (
                <Alert severity="warning">This set has no exercises yet.</Alert>
            )}

            {props.slot.configs.map((slotConfig: SlotConfig) => (
                <SlotConfigDetails
                    key={slotConfig.id}
                    slotConfig={slotConfig}
                    routineId={props.routineId}
                    simpleMode={props.simpleMode}
                />
            ))}
        </>
    );
};

export const SlotConfigDetails = (props: { slotConfig: SlotConfig, routineId: number, simpleMode: boolean }) => {
    const { i18n } = useTranslation();

    const [editExercise, setEditExercise] = useState(false);
    const toggleEditExercise = () => setEditExercise(!editExercise);

    const languageQuery = useLanguageQuery();
    const editSlotQuery = useEditSlotConfigQuery(props.routineId);
    const deleteSlotQuery = useDeleteSlotConfigQuery(props.routineId);

    const handleExerciseChange = (searchResponse: ExerciseSearchResponse | null) => {
        if (searchResponse === null) {
            return;
        }

        editSlotQuery.mutate({ id: props.slotConfig.id, exercise: searchResponse.data.base_id });
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
        <React.Fragment>
            <Grid container spacing={2}>
                <Grid item xs={1}>
                    {/*<IconButton size={"small"} onClick={toggleEditExercise} disabled={true}>*/}
                    {/*    <DragHandle />*/}
                    {/*</IconButton>*/}
                    <IconButton size={"small"} onClick={toggleEditExercise}>
                        {editExercise ? <EditOffIcon /> : <EditIcon />}
                    </IconButton>
                    <IconButton
                        size={"small"}
                        onClick={() => deleteSlotQuery.mutate(props.slotConfig.id)}
                        disabled={deleteSlotQuery.isLoading}
                    >
                        <DeleteIcon />
                    </IconButton>


                </Grid>
                <Grid item xs={11} sm={3}>
                    <Typography variant={"h6"} gutterBottom>
                        {props.slotConfig.exercise?.getTranslation(language).name}
                    </Typography>
                </Grid>
                {editExercise
                    && <React.Fragment>
                        <Grid item xs={8}>
                            <NameAutocompleter callback={handleExerciseChange} />
                        </Grid>
                        <Grid item xs={4} />
                    </React.Fragment>
                }

                {/*<SlotConfigForm routineId={props.routineId} slotConfig={props.slotConfig} />*/}


                {props.simpleMode
                    ? <React.Fragment>
                        <Grid item xs={12} sm={2} key={`sets-config-${props.slotConfig.id}`}>
                            {getConfigComponent('sets', props.slotConfig.nrOfSetsConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={3} key={`weight-config-${props.slotConfig.id}`}>
                            {getConfigComponent('weight', props.slotConfig.weightConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={3} key={`reps-config-${props.slotConfig.id}`}>
                            {getConfigComponent('reps', props.slotConfig.repsConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                    </React.Fragment>

                    // Show all config details in advanced mode, also in a grid
                    : <React.Fragment>
                        <Grid item xs={12} sm={2} key={`slot-config-type-${props.slotConfig.id}`}>
                            <SlotConfigTypeField routineId={props.routineId} slotConfig={props.slotConfig} />
                        </Grid>

                        <Grid item xs={12} sm={2} key={`sets-config-${props.slotConfig.id}`}>
                            {getConfigComponent('sets', props.slotConfig.nrOfSetsConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>

                        <Grid item xs={12} sm={1} key={`rest-config-${props.slotConfig.id}`}>
                            {getConfigComponent('rest', props.slotConfig.restTimeConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={1} key={`max-rest-config-${props.slotConfig.id}`}>
                            {getConfigComponent('max-rest', props.slotConfig.maxRestTimeConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={2} key={`rir-config-${props.slotConfig.id}`}>
                            {getConfigComponent('rir', props.slotConfig.rirConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>


                        <Grid item xs={12} sm={4} />


                        <Grid item xs={12} sm={2} key={`slot-config-rep-unit-${props.slotConfig.id}`}>
                            <SlotConfigRepetitionUnitField slotConfig={props.slotConfig} routineId={props.routineId} />
                        </Grid>
                        <Grid item xs={12} sm={1} key={`reps-config-${props.slotConfig.id}`}>
                            {getConfigComponent('reps', props.slotConfig.repsConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={1} key={`max-reps-config-${props.slotConfig.id}`}>
                            {getConfigComponent('max-reps', props.slotConfig.maxRepsConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>

                        <Grid item xs={12} sm={2} key={`slot-config-weight-unit-${props.slotConfig.id}`}>
                            <SlotConfigWeightUnitField slotConfig={props.slotConfig} routineId={props.routineId} />
                        </Grid>
                        <Grid item xs={12} sm={1} key={`weight-config-${props.slotConfig.id}`}>
                            {getConfigComponent('weight', props.slotConfig.weightConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={1} key={`max-weight-config-${props.slotConfig.id}`}>
                            {getConfigComponent('max-weight', props.slotConfig.maxWeightConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>


                    </React.Fragment>
                }

            </Grid>
            <Box height={20} />
        </React.Fragment>
    );
};