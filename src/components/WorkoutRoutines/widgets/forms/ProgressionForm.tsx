import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import {
    Button,
    IconButton,
    MenuItem,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Tooltip from "@mui/material/Tooltip";
import { WgerTextField } from "components/Common/forms/WgerTextField";
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
}) => {
    const { t } = useTranslation();
    const [linkMinMax, setLinkMinMax] = useState<boolean>(true);
    const [iterationsToDelete, setIterationsToDelete] = useState<number[]>([]);
    const processEntries = useProcessConfigsQuery(props.routineId);

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
            apiPath = ApiPath.REPS_CONFIG;
            apiPathMax = ApiPath.MAX_REPS_CONFIG;
            title = t('routines.reps');
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

                // Value is only required when the entry is actually being edited
                // Conditionally apply integer validation e.g. for sets
                value: yup.number().when('edited', {
                    is: true,
                    then: schema => forceInteger
                        ? schema.integer(t('forms.enterInteger')).typeError(t('forms.enterNumber')).required(t("forms.fieldRequired"))
                        : schema.typeError(t('forms.enterNumber')).required(t("forms.fieldRequired")),
                    otherwise: schema => forceInteger
                        ? schema.integer(t('forms.enterNumber')).nullable().notRequired()
                        : schema.typeError(t('forms.enterNumber')).nullable().notRequired(),
                }),

                // only check that the max number is higher when replacing. In other cases allow the max
                // weight to e.g. increase less than the min weight
                // Conditionally apply integer validation e.g. for sets
                valueMax: yup.number().typeError(t('forms.enterNumber')).nullable()
                    .when('edited', {
                        is: true,
                        then: schema => forceInteger
                            ? schema.integer(t('forms.enterInteger')).typeError(t('forms.enterNumber')).required(t("forms.fieldRequired"))
                            : schema.typeError(t('forms.enterNumber')).required(t("forms.fieldRequired")),
                        otherwise: schema => forceInteger
                            ? schema.integer(t('forms.enterNumber')).nullable().notRequired()
                            : schema.typeError(t('forms.enterNumber')).nullable().notRequired(),
                    })
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
        ),
    });

    const getEmptyConfig = (iter: number, edited: boolean): BaseConfigEntryForm => ({
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
            need_log_to_apply: false,
            requirements: { rules: data.requirements ?? [] }
        }));
        const addList: AddBaseConfigParams[] = data.filter(data => data.id === null && data.value !== '').map(data => ({
            slot_entry: props.slotEntryId,
            value: data.value as number,
            iteration: data.iteration,
            operation: data.operation,
            step: data.step,
            repeat: data.repeat,
            need_log_to_apply: false,
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
            need_log_to_apply: false,
            requirements: { rules: data.requirements ?? [] }
        }));
        const addListMax: AddBaseConfigParams[] = data.filter(data => data.idMax === null && data.valueMax !== '').map(data => ({
            iteration: data.iteration,
            slot_entry: props.slotEntryId,
            value: data.valueMax as number,
            operation: data.operation,
            step: data.stepMax,
            repeat: data.repeat,
            need_log_to_apply: false,
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
        processEntries.mutate({ toAdd: addList, toDelete: deleteList, toEdit: editList, apiPath: apiPath });
        processEntries.mutate({ toAdd: addListMax, toDelete: deleteListMax, toEdit: editListMax, apiPath: apiPathMax });
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

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>
                                            Value
                                            <IconButton onClick={() => setLinkMinMax(!linkMinMax)}>
                                                {linkMinMax ? <LinkIcon /> : <LinkOffIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{t('routines.operation')}</TableCell>
                                        <TableCell>{t('routines.step')}</TableCell>
                                        <TableCell>
                                            {t('routines.requirements')}
                                            <Tooltip title={t('routines.requirementsHelpText')}>
                                                <IconButton onClick={() => {
                                                }}>
                                                    <HelpOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            {t('routines.repeat')}
                                            <Tooltip title={t('routines.repeatHelpText')}>
                                                <IconButton onClick={() => {
                                                }}>
                                                    <HelpOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>

                                    <FieldArray name={"entries"} validateOnChange={true}>
                                        {({ insert, remove }) => (<>

                                                {formik.values.entries.map((log, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{t('routines.workoutNr', { number: log.iteration })}</TableCell>
                                                        <TableCell>
                                                            {log.edited
                                                                ? <IconButton
                                                                    disabled={log.iteration === 1 && props.configs.length > 1}
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
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.edited && <>
                                                                <WgerTextField
                                                                    fieldName={`entries.${index}.value`}
                                                                    title={"min"}
                                                                    fullwidth={false}
                                                                />
                                                                &nbsp;
                                                                <WgerTextField
                                                                    fieldName={`entries.${index}.valueMax`}
                                                                    title={"max"}
                                                                    fullwidth={false}
                                                                />
                                                            </>}

                                                        </TableCell>
                                                        <TableCell>
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
                                                        </TableCell>
                                                        <TableCell>
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
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.edited &&
                                                                <ConfigDetailsRequirementsField
                                                                    disabled={log.iteration === 1 || log.operation === OPERATION_REPLACE}
                                                                    values={log.requirements}
                                                                    fieldName={`entries.${index}.requirements`} />}
                                                            {log.requirements.length >= 0 && log.requirements.map((requirement, index) => (
                                                                <Typography key={index} variant={'caption'}>
                                                                    {requirement} &nbsp;
                                                                </Typography>
                                                            ))}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Switch
                                                                checked={formik.values.entries[index].repeat}
                                                                {...formik.getFieldProps(`entries.${index}.repeat`)}
                                                                disabled={log.iteration === 1 || log.operation === OPERATION_REPLACE}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </>
                                        )}
                                    </FieldArray>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Grid container spacing={2}>
                            <Grid size={12} display={"flex"} justifyContent={"end"}>
                                <Button
                                    color="primary"
                                    disabled={!formik.isValid || formik.isSubmitting || !formik.dirty}
                                    variant="contained"
                                    type="submit"
                                    sx={{ mt: 2 }}>
                                    {t('submit')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Form>
                )}
            </Formik>
        </Stack>
    </>;
};
