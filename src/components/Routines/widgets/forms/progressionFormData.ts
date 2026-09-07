import {
    AddBaseConfigParams,
    EditBaseConfigParams,
    ProcessBaseConfigsParams
} from "@/components/Routines/api/baseConfig";
import {
    BaseConfig,
    BaseConfigEntryForm,
    OPERATION_REPLACE,
    REQUIREMENTS_VALUES
} from "@/components/Routines/models/BaseConfig";
import { ApiPath } from "@/core/lib/consts";
import { TFunction } from "i18next";
import * as yup from "yup";

export interface ProgressionFormValues {
    entries: BaseConfigEntryForm[],
}

export const emptyEntry = (iteration: number, edited: boolean, forceInteger: boolean): BaseConfigEntryForm => ({
    forceInteger: forceInteger,

    edited: edited,
    iteration: iteration,

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

/** One row per iteration, filled from the stored min and max configs */
export function progressionEntries(
    iterations: number[],
    configs: BaseConfig[],
    configsMax: BaseConfig[],
    forceInteger: boolean,
): BaseConfigEntryForm[] {
    return iterations.map(iteration => {
        const config = configs.find((c) => c.iteration === iteration);
        const configMax = configsMax.find((c) => c.iteration === iteration);

        if (config === undefined) {
            return emptyEntry(iteration, false, forceInteger);
        }
        return {
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
        };
    });
}

export const progressionSchema = (t: TFunction) => yup.object({
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

interface PayloadContext {
    slotEntryId: number,
    configs: BaseConfig[],
    configsMax: BaseConfig[],
    /** Iterations whose stored config the user deleted in the form */
    iterationsToDelete: number[],
    apiPath: ApiPath,
    apiPathMax: ApiPath,
}

/** What the server has to add, edit and delete so it holds these entries */
export function progressionPayload(
    entries: BaseConfigEntryForm[],
    { slotEntryId, configs, configsMax, iterationsToDelete, apiPath, apiPathMax }: PayloadContext,
): { values: ProcessBaseConfigsParams, maxValues: ProcessBaseConfigsParams } {
    // Remove empty entries
    const data = entries.filter(e => e.edited);

    // Split between min and max values
    const editList: EditBaseConfigParams[] = data.filter(data => data.id !== null).map(data => ({
        id: data.id!,
        // eslint-disable-next-line camelcase
        slot_entry: slotEntryId,
        value: data.value as number,
        iteration: data.iteration,
        operation: data.operation,
        step: data.step,
        repeat: data.repeat,
        requirements: { rules: data.requirements ?? [] }
    }));
    const addList: AddBaseConfigParams[] = data.filter(data => data.id === null && data.value !== '').map(data => ({
        // eslint-disable-next-line camelcase
        slot_entry: slotEntryId,
        value: data.value as number,
        iteration: data.iteration,
        operation: data.operation,
        step: data.step,
        repeat: data.repeat,
        requirements: { rules: data.requirements ?? [] }
    }));
    // Items to delete, also includes all where the value is empty
    const deleteList = configs.filter(c => iterationsToDelete.includes(c.iteration)).map(c => c.id);
    data.forEach(entry => {
        if (entry.value === "" && entry.id !== null && !deleteList.includes(entry.id)) {
            deleteList.push(entry.id);
        }
    });

    // Max values
    const editListMax: EditBaseConfigParams[] = data.filter(data => data.idMax !== null && data.valueMax !== '').map(data => ({
        id: data.idMax!,
        // eslint-disable-next-line camelcase
        slot_entry: slotEntryId,
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
        slot_entry: slotEntryId,
        value: data.valueMax as number,
        operation: data.operation,
        step: data.stepMax,
        repeat: data.repeat,
        requirements: { rules: data.requirements ?? [] }
    }));
    // Items to delete, also includes all where the value is empty
    const deleteListMax = configsMax.filter(c => iterationsToDelete.includes(c.iteration)).map(c => c.id);
    data.forEach(entry => {
        if (entry.valueMax === "" && entry.idMax !== null && !deleteList.includes(entry.idMax)) {
            deleteListMax.push(entry.idMax);
        }
    });

    return {
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
    };
}
