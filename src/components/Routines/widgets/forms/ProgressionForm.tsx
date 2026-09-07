import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import { Box, Button, Divider, IconButton, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import { useAppForm } from "@/core/forms/appForm";
import { yupSchema } from "@/core/forms/formUtils";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import {
    BaseConfig,
    BaseConfigEntryForm,
    OPERATION_REPLACE,
    OPERATION_VALUES_SELECT,
    OperationType,
    REQUIREMENTS_VALUES,
    STEP_VALUES_SELECT,
    StepType
} from "@/components/Routines/models/BaseConfig";
import { useProcessConfigsQuery } from "@/components/Routines/queries/configs";
import { ConfigDetailsRequirementsField, ConfigType } from "@/components/Routines/widgets/forms/BaseConfigForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddBaseConfigParams, EditBaseConfigParams } from "@/components/Routines/api/baseConfig";
import { ApiPath } from "@/core/lib/consts";
import * as yup from "yup";

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

interface ProgressionFormValues {
    entries: BaseConfigEntryForm[],
}

const getEmptyConfig = (iter: number, edited: boolean, forceInteger: boolean): BaseConfigEntryForm => ({
    forceInteger: forceInteger,

    edited: edited,
    iteration: iter,

    id: null,
    idMax: null,
    value: '',
    valueMax: '',
    operation: OPERATION_REPLACE,
    operationMax: OPERATION_REPLACE,
    step: "abs",
    stepMax: "abs",
    requirements: [],
    requirementsMax: [],
    repeat: false,
    repeatMax: false,
});

export const ProgressionForm = (props: ProgressionFormProps) => {
    const forceInteger = props.forceInteger ?? false;

    const defaultEntries: BaseConfigEntryForm[] = [];
    for (const iteration of props.iterations) {
        const config: BaseConfig | undefined = props.configs.find((c) => c.iteration === iteration);
        const configMax: BaseConfig | undefined = props.configsMax.find((c) => c.iteration === iteration);

        if (config === undefined) {
            defaultEntries.push(getEmptyConfig(iteration, false, forceInteger));
        } else {
            defaultEntries.push({
                forceInteger: forceInteger,

                edited: true,
                id: config.id,
                idMax: configMax === undefined ? null : configMax.id,
                iteration: iteration,
                value: String(config.value),
                valueMax: configMax === undefined ? '' : String(configMax.value),
                operation: config.operation,
                operationMax: configMax === undefined ? OPERATION_REPLACE : config.operation,
                step: config.step,
                stepMax: configMax === undefined ? "abs" : configMax.step,
                requirements: config.requirements?.rules ?? [],
                requirementsMax: configMax === undefined ? [] : configMax.requirements?.rules ?? [],
                repeat: config.repeat,
                repeatMax: configMax === undefined ? false : config.repeat,
            });
        }
    }

    // The form freezes its default values, so saved or reloaded configs get a
    // fresh form via the key
    return <ProgressionFields
        key={JSON.stringify(defaultEntries)}
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

    const validationSchema = yup.object({
        entries: yup.array().of(
            yup.object().shape({
                edited: yup.boolean(),
                iteration: yup.number().required(),

                // Conditionally apply integer validation e.g. for sets
                value: yup.number()
                    .when('forceInteger', {
                        is: true,
                        then: schema => schema.integer(t('forms.enterInteger')).typeError(t('forms.enterNumber')),
                        otherwise: schema => schema.typeError(t('forms.enterNumber')).nullable().notRequired(),
                    }),

                // only check that the max number is higher when replacing. In other cases allow the max
                // weight to e.g. increase less than the min weight
                valueMax: yup.number().typeError(t('forms.enterNumber')).nullable()
                    .when('forceInteger', {
                        is: true,
                        then: schema => schema.integer(t('forms.enterInteger')).typeError(t('forms.enterNumber')),
                        otherwise: schema => schema.typeError(t('forms.enterNumber')).nullable().notRequired(),
                    })
                    // Conditionally apply integer validation e.g. for sets
                    .when('operation', {
                        is: OPERATION_REPLACE,
                        then: schema => schema.min(yup.ref('value'), t('forms.maxLessThanMin')),
                        otherwise: schema => schema,
                    }),
                operation: yup.string().required(),
                operationMax: yup.string().required(),
                requirements: yup.array().of(yup.string().oneOf(REQUIREMENTS_VALUES)),
                requirementsMax: yup.array().of(yup.string().oneOf(REQUIREMENTS_VALUES)),
                repeat: yup.boolean(),
                repeatMax: yup.boolean()
            })
        )
            .test(
                'inter-entry-validation',
                'Your error message here',
                function (entries) { // Use 'function' to access 'this'
                    const { createError } = this;

                    const data = entries as unknown as BaseConfigEntryForm[];

                    for (let i = 0; i < data.length; i++) {
                        const entry = data[i];

                        // If there is an entry down the line
                        // if (entry.iteration === 1 && data.length > 1 && !entry.value && entry.edited) {
                        //     return createError({
                        //         path: `entries[${i}].value`,
                        //         message: 'Value is required at workout nr 1 when other entries exist'
                        //     });
                        // }

                        if (entry.iteration > 1 && entry.operation !== OPERATION_REPLACE) {
                            let hasValuePreviousReplace = false;
                            let hasMaxValuePreviousReplace = false;

                            for (let j = 0; j < i; j++) {
                                if (data[j].operation === OPERATION_REPLACE && data[j].value !== '' && data[j].edited) {
                                    hasValuePreviousReplace = true;
                                }

                                if (data[j].operation === OPERATION_REPLACE && data[j].valueMax !== '' && data[j].edited) {
                                    hasMaxValuePreviousReplace = true;
                                }
                            }

                            if (!hasValuePreviousReplace) {
                                return createError({
                                    path: `entries[${i}].value`,
                                    message: t('routines.progressionNeedsReplace')
                                });
                            }
                            if (!hasMaxValuePreviousReplace) {
                                return createError({
                                    path: `entries[${i}].valueMax`,
                                    message: t('routines.progressionNeedsReplace')
                                });
                            }
                        }
                    }

                    // All entries valid
                    return true;
                }
            )
        ,
    });

    const handleSubmit = (values: ProgressionFormValues) => {
        // Remove empty entries
        const data = values.entries.filter(e => e.edited);

        // Split between min and max values
        const editList: EditBaseConfigParams[] = data.filter(data => data.id !== null).map(data => ({
            id: data.id!,
            // eslint-disable-next-line camelcase
            slot_entry: props.slotEntryId,
            value: data.value as number,
            iteration: data.iteration,
            operation: data.operation,
            step: data.step,
            repeat: data.repeat,
            requirements: { rules: data.requirements ?? [] }
        }));
        const addList: AddBaseConfigParams[] = data.filter(data => data.id === null && data.value !== '').map(data => ({
            // eslint-disable-next-line camelcase
            slot_entry: props.slotEntryId,
            value: data.value as number,
            iteration: data.iteration,
            operation: data.operation,
            step: data.step,
            repeat: data.repeat,
            requirements: { rules: data.requirements ?? [] }
        }));
        // Items to delete, also includes all where the value is empty
        const deleteList = props.configs.filter(c => iterationsToDelete.includes(c.iteration)).map(c => c.id);
        data.forEach(entry => {
            if (entry.value === "" && entry.id !== null && !deleteList.includes(entry.id)) {
                deleteList.push(entry.id);
            }
        });

        // Max values
        const editListMax: EditBaseConfigParams[] = data.filter(data => data.idMax !== null && data.valueMax !== '').map(data => ({
            id: data.idMax!,
            // eslint-disable-next-line camelcase
            slot_entry: props.slotEntryId,
            value: data.valueMax as number,
            iteration: data.iteration,
            operation: data.operation,
            step: data.step,
            repeat: data.repeat,
            requirements: { rules: data.requirements ?? [] }
        }));
        const addListMax: AddBaseConfigParams[] = data.filter(data => data.idMax === null && data.valueMax !== '').map(data => ({
            iteration: data.iteration,
            // eslint-disable-next-line camelcase
            slot_entry: props.slotEntryId,
            value: data.valueMax as number,
            operation: data.operation,
            step: data.stepMax,
            repeat: data.repeat,
            requirements: { rules: data.requirements ?? [] }
        }));
        // Items to delete, also includes all where the value is empty
        const deleteListMax = props.configsMax.filter(c => iterationsToDelete.includes(c.iteration)).map(c => c.id);
        data.forEach(entry => {
            if (entry.valueMax === "" && entry.idMax !== null && !deleteList.includes(entry.idMax)) {
                deleteListMax.push(entry.idMax);
            }
        });

        // Save to server
        processEntriesQuery.mutate({
            values: {
                toAdd: addList,
                toDelete: deleteList,
                toEdit: editList,
                apiPath: apiPath
            },
            maxValues: {
                toAdd: addListMax,
                toDelete: deleteListMax,
                toEdit: editListMax,
                apiPath: apiPathMax
            }
        });
    };

    const form = useAppForm({
        defaultValues: { entries: props.defaultEntries } as ProgressionFormValues,
        validators: { onChange: yupSchema<ProgressionFormValues>(validationSchema) },
        onSubmit: async ({ value }) => handleSubmit(value),
    });

    return <>
        <Stack sx={{ width: '100%' }}>
            <Typography variant={"h6"}>{title}</Typography>
            <form onSubmit={e => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}>
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
                                                form.replaceFieldValue('entries', index, getEmptyConfig(log.iteration, false, forceInteger));
                                            }}>
                                            <DeleteIcon />
                                        </IconButton>
                                        : <IconButton size="small" onClick={() => {
                                            form.replaceFieldValue('entries', index, getEmptyConfig(log.iteration, true, forceInteger));
                                        }}>
                                            <AddIcon />
                                        </IconButton>
                                    }
                                </Grid>


                                <Grid size={2}>
                                    {log.edited &&
                                        <form.AppField name={`entries[${index}].value`}>
                                            {field => <field.WgerTextField
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
