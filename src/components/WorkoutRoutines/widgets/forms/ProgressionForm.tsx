import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Box, Button, Divider, IconButton, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import { WgerTextField } from "components/Common/forms/WgerTextField";
import { FormQueryErrors } from "components/Core/Widgets/FormError";
import {
    BaseConfig,
    BaseConfigEntryForm,
    OPERATION_REPLACE,
    OPERATION_VALUES_SELECT,
    REQUIREMENTS_VALUES,
    STEP_VALUES_SELECT
} from "components/WorkoutRoutines/models/BaseConfig";
import { useProcessConfigsQuery } from "components/WorkoutRoutines/queries/configs";
import { ConfigDetailsRequirementsField, ConfigType } from "components/WorkoutRoutines/widgets/forms/BaseConfigForm";
import { FieldArray, Form, Formik } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddBaseConfigParams, EditBaseConfigParams } from "services/base_config";
import { ApiPath } from "utils/consts";
import * as yup from "yup";

export const ProgressionForm = (props: {
    configs: BaseConfig[],
    configsMax: BaseConfig[],
    type: ConfigType,
    slotEntryId: number,
    routineId: number,
    iterations: number[],
    forceInteger?: boolean;
    cycleLength: number;
}) => {
    const { t } = useTranslation();
    const [linkMinMax, setLinkMinMax] = useState<boolean>(true);
    const [iterationsToDelete, setIterationsToDelete] = useState<number[]>([]);
    const processEntriesQuery = useProcessConfigsQuery(props.routineId);

    const forceInteger = props.forceInteger ?? false;

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
                function (entries, context,) { // Use 'function' to access 'this'
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

    const getEmptyConfig = (iter: number, edited: boolean): BaseConfigEntryForm => ({
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

    const initialValues = { entries: [] as BaseConfigEntryForm[] };
    for (const iteration of props.iterations) {
        const config: BaseConfig | undefined = props.configs.find((c) => c.iteration === iteration);
        const configMax: BaseConfig | undefined = props.configsMax.find((c) => c.iteration === iteration);

        if (config === undefined) {
            initialValues.entries.push(getEmptyConfig(iteration, false));
        } else {
            initialValues.entries.push({
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

    const handleSubmit = (values: { entries: BaseConfigEntryForm[] }) => {
        // Remove empty entries
        const data = values.entries.filter(e => e.edited);

        // Split between min and max values
        const editList: EditBaseConfigParams[] = data.filter(data => data.id !== null).map(data => ({
            id: data.id!,
            slot_entry: props.slotEntryId,
            value: data.value as number,
            iteration: data.iteration,
            operation: data.operation,
            step: data.step,
            repeat: data.repeat,
            requirements: { rules: data.requirements ?? [] }
        }));
        const addList: AddBaseConfigParams[] = data.filter(data => data.id === null && data.value !== '').map(data => ({
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


    return <>
        <Stack sx={{ width: '100%' }}>
            <Typography variant={"h6"}>{title}</Typography>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    handleSubmit(values);
                    setSubmitting(false);
                }}
            >
                {formik => (
                    <Form>
                        <Grid container spacing={1}>
                            <Grid size={4} offset={2} textAlign={"center"}>
                                {t('value')}
                                {/*<IconButton onClick={() => setLinkMinMax(!linkMinMax)}>*/}
                                {/*    {linkMinMax ? <LinkIcon /> : <LinkOffIcon />}*/}
                                {/*</IconButton>*/}
                            </Grid>
                            <Grid size={6}>
                                <Grid container spacing={1}>
                                    <Grid size={3}>
                                        {t('routines.operation')}
                                    </Grid>
                                    <Grid size={3}>
                                        {t('routines.step')}
                                    </Grid>
                                    <Grid size={3} textAlign={'center'}>
                                        {t('routines.requirements')}
                                        <br />
                                        <Tooltip title={t('routines.requirementsHelpText')}>
                                            <IconButton onClick={() => {
                                            }}>
                                                <HelpOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid size={3} textAlign={'center'}>
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


                            <FieldArray name={"entries"} validateOnChange={true}>
                                {({ insert, remove }) => (<>

                                        {formik.values.entries.map((log, index) => (
                                            <React.Fragment key={index}>
                                                <Grid size={2} display={'flex'} justifyContent={'space-around'}
                                                      alignItems={'center'}>
                                                    {props.cycleLength === 7 ? t('routines.weekNr', { number: log.iteration }) : t('routines.workoutNr', { number: log.iteration })}
                                                    {log.edited
                                                        ? <IconButton
                                                            // Allow deleting the first element if it's not the only one
                                                            disabled={log.iteration === 1 && formik.values.entries.filter(e => e.edited && e.iteration !== 1).length > 0}
                                                            size="small"
                                                            onClick={() => {
                                                                if (log.id !== null) {
                                                                    setIterationsToDelete([...iterationsToDelete, log.iteration]);
                                                                }
                                                                remove(index);
                                                                insert(index, getEmptyConfig(log.iteration, false));
                                                            }}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                        : <IconButton size="small" onClick={() => {
                                                            remove(index);
                                                            insert(index, getEmptyConfig(log.iteration, true));
                                                        }}>
                                                            <AddIcon />
                                                        </IconButton>
                                                    }
                                                </Grid>


                                                <Grid size={2}>
                                                    {log.edited &&
                                                        <WgerTextField
                                                            fieldName={`entries.${index}.value`}
                                                            title={t('min')}
                                                            fullwidth={true}
                                                        />}
                                                </Grid>
                                                <Grid size={2}>
                                                    {log.edited && <WgerTextField
                                                        fieldName={`entries.${index}.valueMax`}
                                                        title={t('max')}
                                                        fullwidth={true}
                                                    />
                                                    }

                                                </Grid>
                                                <Grid size={6}>
                                                    <Grid container spacing={1}>
                                                        <Grid size={3}>
                                                            {log.edited && <TextField
                                                                disabled={log.iteration === 1}
                                                                fullWidth
                                                                select
                                                                label={t('routines.operation')}
                                                                variant="standard"
                                                                {...formik.getFieldProps(`entries.${index}.operation`)}
                                                                onChange={async (e) => {
                                                                    formik.handleChange(e);
                                                                    if (e.target.value === OPERATION_REPLACE) {
                                                                        await formik.setFieldValue(`entries.${index}.requirements`, []);
                                                                        await formik.setFieldValue(`entries.${index}.repeat`, false);
                                                                    }
                                                                }}
                                                            >
                                                                {OPERATION_VALUES_SELECT.map((option) => (
                                                                    <MenuItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>}

                                                        </Grid>
                                                        <Grid size={3}>
                                                            {log.edited && <TextField
                                                                disabled={log.iteration === 1 || log.operation === OPERATION_REPLACE}
                                                                fullWidth
                                                                select
                                                                label={t('routines.step')}
                                                                variant="standard"
                                                                {...formik.getFieldProps(`entries.${index}.step`)}
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
                                                        </Grid>
                                                        <Grid size={3} textAlign={'center'}>
                                                            {log.edited &&
                                                                <ConfigDetailsRequirementsField
                                                                    disabled={log.iteration === 1 || log.operation === OPERATION_REPLACE}
                                                                    values={log.requirements}
                                                                    fieldName={`entries.${index}.requirements`} />}
                                                            {log.requirements.length >= 0 && <br />}
                                                            {log.requirements.length >= 0 && log.requirements.map((requirement, index) => (
                                                                <Typography key={index} variant={'caption'}>
                                                                    {requirement} &nbsp;
                                                                </Typography>
                                                            ))}
                                                        </Grid>
                                                        <Grid size={3} textAlign={'center'}>
                                                            {log.edited && <Switch
                                                                checked={formik.values.entries[index].repeat}
                                                                {...formik.getFieldProps(`entries.${index}.repeat`)}
                                                                disabled={log.iteration === 1 || log.operation === OPERATION_REPLACE}
                                                            />}
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </React.Fragment>
                                        ))}
                                    </>
                                )}
                            </FieldArray>
                            {processEntriesQuery.isError && <Grid size={12}>
                                <FormQueryErrors mutationQuery={processEntriesQuery} />
                            </Grid>}

                            <Grid size={12} display={"flex"} justifyContent={"end"}>
                                <Button
                                    color="primary"
                                    disabled={!formik.isValid || formik.isSubmitting || !formik.dirty}
                                    variant="contained"
                                    type="submit"
                                    sx={{ mt: 2 }}>
                                    {t('save')}
                                </Button>
                            </Grid>
                            <Grid size={12}>
                                <Box height={20}></Box>
                            </Grid>
                        </Grid>
                    </Form>
                )}
            </Formik>
        </Stack>
    </>;
};
