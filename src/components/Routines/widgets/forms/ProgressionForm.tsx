import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import { Box, Button, Divider, IconButton, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import { useAppForm } from "@/core/forms/appForm";
import { defaultsKey, submitHandler, yupSchema } from "@/core/forms/formUtils";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import {
    BaseConfig,
    BaseConfigEntryForm,
    OPERATION_REPLACE,
    OPERATION_VALUES_SELECT,
    OperationType,
    STEP_VALUES_SELECT,
    StepType
} from "@/components/Routines/models/BaseConfig";
import { useProcessConfigsQuery } from "@/components/Routines/queries/configs";
import { ConfigDetailsRequirementsField, ConfigType } from "@/components/Routines/widgets/forms/BaseConfigForm";
import {
    emptyEntry,
    progressionEntries,
    progressionPayload,
    progressionSchema,
    ProgressionFormValues
} from "@/components/Routines/widgets/forms/progressionFormData";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiPath } from "@/core/lib/consts";

interface ProgressionFormProps {
    configs: BaseConfig[],
    configsMax: BaseConfig[],
    type: ConfigType,
    slotEntryId: number,
    routineId: number,
    iterations: number[],
    forceInteger?: boolean;
    isWeeklyCycle: boolean;
}

export const ProgressionForm = (props: ProgressionFormProps) => {
    const forceInteger = props.forceInteger ?? false;
    const defaultEntries = progressionEntries(props.iterations, props.configs, props.configsMax, forceInteger);

    // The form freezes its default values, so saved or reloaded configs get a
    // fresh form via the key
    return <ProgressionFields
        key={defaultsKey(defaultEntries)}
        {...props}
        forceInteger={forceInteger}
        defaultEntries={defaultEntries}
    />;
};

const ProgressionFields = (props: ProgressionFormProps & {
    forceInteger: boolean,
    defaultEntries: BaseConfigEntryForm[],
}) => {
    const { t } = useTranslation();
    const [iterationsToDelete, setIterationsToDelete] = useState<number[]>([]);
    const processEntriesQuery = useProcessConfigsQuery(props.routineId);
    const forceInteger = props.forceInteger;

    let apiPath: ApiPath;
    let apiPathMax: ApiPath;
    let title = '';
    switch (props.type) {
        case "weight":
            apiPath = ApiPath.WEIGHT_CONFIG;
            apiPathMax = ApiPath.MAX_WEIGHT_CONFIG;
            title = t('weight');
            break;
        case "reps":
            apiPath = ApiPath.REPETITIONS_CONFIG;
            apiPathMax = ApiPath.MAX_REPS_CONFIG;
            title = t('server.repetitions');
            break;
        case "sets":
            apiPath = ApiPath.NR_OF_SETS_CONFIG;
            apiPathMax = ApiPath.MAX_NR_OF_SETS_CONFIG;
            title = t('routines.sets');
            break;
        case "rest":
            apiPath = ApiPath.REST_CONFIG;
            apiPathMax = ApiPath.MAX_REST_CONFIG;
            title = t('routines.restTime');
            break;
        case "rir":
            apiPath = ApiPath.RIR_CONFIG;
            apiPathMax = ApiPath.MAX_RIR_CONFIG;
            title = t('routines.rir');
            break;
    }

    const form = useAppForm({
        defaultValues: { entries: props.defaultEntries } as ProgressionFormValues,
        validators: { onChange: yupSchema<ProgressionFormValues>(progressionSchema(t)) },
        onSubmit: async ({ value }) => processEntriesQuery.mutate(progressionPayload(value.entries, {
            slotEntryId: props.slotEntryId,
            configs: props.configs,
            configsMax: props.configsMax,
            iterationsToDelete,
            apiPath,
            apiPathMax,
        })),
    });

    return <>
        <Stack sx={{ width: '100%' }}>
            <Typography variant={"h6"}>{title}</Typography>
            <form onSubmit={submitHandler(form)}>
                <Grid container spacing={1}>
                    <Grid size={4} offset={2} sx={{ textAlign: "center" }}>
                        {t('value')}
                    </Grid>
                    <Grid size={6}>
                        <Grid container spacing={1}>
                            <Grid size={3}>
                                {t('routines.operation')}
                            </Grid>
                            <Grid size={3}>
                                {t('routines.step')}
                            </Grid>
                            <Grid size={3} sx={{ textAlign: 'center' }}>
                                {t('routines.requirements')}
                                <br />
                                <Tooltip title={t('routines.requirementsHelpText')}>
                                    <IconButton onClick={() => {
                                    }}>
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                            <Grid size={3} sx={{ textAlign: 'center' }}>
                                {t('routines.repeat')}
                                <br />
                                <Tooltip title={t('routines.repeatHelpText')}>
                                    <IconButton onClick={() => {
                                    }}>
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid size={12}>
                        <Divider />
                    </Grid>


                    {/* The rows read every value of every entry, which an array field
                      * does not re-render for: it only follows the array's length */}
                    <form.Subscribe selector={state => state.values.entries}>
                        {entries => entries.map((log, index) => (
                            <React.Fragment key={`progression-${log.iteration}`}>
                                <Grid size={2} sx={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    alignItems: 'center'
                                }}>
                                    {props.isWeeklyCycle ? t('routines.weekNr', { number: log.iteration }) : t('routines.workoutNr', { number: log.iteration })}
                                    {log.edited
                                        ? <IconButton
                                            // Allow deleting the first element if it's not the only one
                                            disabled={log.iteration === 1 && entries.filter(e => e.edited && e.iteration !== 1).length > 0}
                                            size="small"
                                            onClick={() => {
                                                if (log.id !== null) {
                                                    setIterationsToDelete([...iterationsToDelete, log.iteration]);
                                                }
                                                form.replaceFieldValue('entries', index, emptyEntry(log.iteration, false, forceInteger));
                                            }}>
                                            <DeleteIcon />
                                        </IconButton>
                                        : <IconButton size="small" onClick={() => {
                                            form.replaceFieldValue('entries', index, emptyEntry(log.iteration, true, forceInteger));
                                        }}>
                                            <AddIcon />
                                        </IconButton>
                                    }
                                </Grid>


                                <Grid size={2}>
                                    {log.edited &&
                                        <form.AppField name={`entries[${index}].value`}>
                                            {field => <field.WgerTextField
                                                variant="standard"
                                                title={t('min')}
                                                fullwidth={true}
                                                fieldProps={{ slotProps: { htmlInput: { inputMode: 'decimal' } } }}
                                            />}
                                        </form.AppField>}
                                </Grid>
                                <Grid size={2}>
                                    {log.edited &&
                                        <form.AppField name={`entries[${index}].valueMax`}>
                                            {field => <field.WgerTextField
                                                variant="standard"
                                                title={t('max')}
                                                fullwidth={true}
                                                fieldProps={{ slotProps: { htmlInput: { inputMode: 'decimal' } } }}
                                            />}
                                        </form.AppField>}

                                </Grid>
                                <Grid size={6}>
                                    <Grid container spacing={1}>
                                        <Grid size={3}>
                                            {log.edited && <form.Field name={`entries[${index}].operation`}>
                                                {field => <TextField
                                                    disabled={log.iteration === 1}
                                                    fullWidth
                                                    select
                                                    label={t('routines.operation')}
                                                    variant="standard"
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => {
                                                        field.handleChange(e.target.value as OperationType);
                                                        if (e.target.value === OPERATION_REPLACE) {
                                                            form.setFieldValue(`entries[${index}].requirements`, []);
                                                            form.setFieldValue(`entries[${index}].repeat`, false);
                                                        }
                                                    }}
                                                >
                                                    {OPERATION_VALUES_SELECT.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>}
                                            </form.Field>}

                                        </Grid>
                                        <Grid size={3}>
                                            {log.edited && <form.Field name={`entries[${index}].step`}>
                                                {field => <TextField
                                                    disabled={log.iteration === 1 || log.operation === OPERATION_REPLACE}
                                                    fullWidth
                                                    select
                                                    label={t('routines.step')}
                                                    variant="standard"
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onChange={e => field.handleChange(e.target.value as StepType)}
                                                    onBlur={field.handleBlur}
                                                >
                                                    {STEP_VALUES_SELECT.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                    {/* "not applicable" is set automatically by the server */}
                                                    {(log.iteration === 1 || log.operation === OPERATION_REPLACE) &&
                                                        <MenuItem key="na" value="na">
                                                            n/a
                                                        </MenuItem>}
                                                </TextField>}
                                            </form.Field>}
                                        </Grid>
                                        <Grid size={3} sx={{ textAlign: 'center' }}>
                                            {log.edited &&
                                                <ConfigDetailsRequirementsField
                                                    disabled={log.iteration === 1 || log.operation === OPERATION_REPLACE}
                                                    values={log.requirements}
                                                    onChange={values => form.setFieldValue(`entries[${index}].requirements`, values)}
                                                />}
                                            {log.requirements.length >= 0 && <br />}
                                            {log.requirements.length >= 0 && log.requirements.map((requirement) => (
                                                <Typography key={JSON.stringify(requirement)} variant={'caption'}>
                                                    {requirement} &nbsp;
                                                </Typography>
                                            ))}
                                        </Grid>
                                        <Grid size={3} sx={{ textAlign: 'center' }}>
                                            {log.edited && <form.Field name={`entries[${index}].repeat`}>
                                                {field => <Switch
                                                    name={field.name}
                                                    checked={field.state.value}
                                                    onChange={event => field.handleChange(event.target.checked)}
                                                    onBlur={field.handleBlur}
                                                    disabled={log.iteration === 1 || log.operation === OPERATION_REPLACE}
                                                />}
                                            </form.Field>}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </React.Fragment>
                        ))}
                    </form.Subscribe>
                    {processEntriesQuery.isError && <Grid size={12}>
                        <FormQueryErrors mutationQuery={processEntriesQuery} />
                    </Grid>}

                    <Grid size={12} sx={{ display: "flex", justifyContent: "end" }}>
                        <form.Subscribe selector={state => ({
                            isValid: state.isValid,
                            isSubmitting: state.isSubmitting,
                            isDirty: state.isDirty,
                        })}>
                            {({ isValid, isSubmitting, isDirty }) => <Button
                                color="primary"
                                disabled={!isValid || isSubmitting || !isDirty}
                                variant="contained"
                                type="submit"
                                sx={{ mt: 2 }}>
                                {t('save')}
                            </Button>}
                        </form.Subscribe>
                    </Grid>
                    <Grid size={12}>
                        <Box sx={{ height: 20 }} />
                    </Grid>
                </Grid>
            </form>
        </Stack>
    </>;
};
