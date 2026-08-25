import { useFetchExercisesByUuidsQuery } from "@/components/Exercises";
import {
    BIG_THREE_UUIDS,
    CalculationSlug,
    CalculationType,
    defaultParams
} from "@/components/Measurements/models/Calculation";
import { CategoryFormValues } from "@/components/Measurements/widgets/categoryFormValues";
import React from 'react';
import { useTranslation } from "react-i18next";

/** The part of formik the prefill writes to */
interface PrefillTarget {
    values: CategoryFormValues;
    setValues: (values: CategoryFormValues) => unknown;
    setFieldValue: (field: string, value: unknown) => unknown;
}

/**
 * Switching the form to a calculation, with what that suggests: parameters at
 * their defaults, a name and a unit as long as the user has not written their
 * own, and the big three for a total of several exercises.
 *
 * [isEdit] seeds "the user wrote this": an existing category counts as written
 * throughout, so editing one never overwrites what it holds.
 */
export const useCalculationPrefill = (isEdit: boolean) => {
    const [t] = useTranslation();
    const fetchExercisesByUuids = useFetchExercisesByUuidsQuery();

    // Which calculation the last pick was for, see prefillBigThree
    const pickedRef = React.useRef('');
    const [nameEdited, setNameEdited] = React.useState(isEdit);
    const [unitEdited, setUnitEdited] = React.useState(isEdit);

    /**
     * A total of several exercises means bench press, squat and deadlift for
     * most people, so that is what a fresh one starts with. The chips stay
     * removable, and an instance that never synced them prefills nothing.
     */
    const prefillBigThree = async (formik: PrefillTarget, type: CalculationType) => {
        const param = type.params.find(candidate => candidate.kind === 'exercises');
        if (param === undefined) {
            return;
        }

        try {
            const exercises = await fetchExercisesByUuids(BIG_THREE_UUIDS);
            const ids = exercises
                .map(exercise => exercise.id)
                .filter((id): id is number => id !== null);

            // The user may have picked something else while this was loading
            if (ids.length === BIG_THREE_UUIDS.length && pickedRef.current === type.slug) {
                formik.setFieldValue('params', { ...defaultParams(type), [param.key]: ids });
            }
        } catch {
            // Nothing to prefill, the user picks the exercises themselves
        }
    };

    const pickCalculation = (formik: PrefillTarget, type?: CalculationType) => {
        if (type === undefined) {
            return;
        }
        pickedRef.current = type.slug;

        // One update, not one per field: each validates on its own and would
        // check the new parameters against the calculation before them
        formik.setValues({
            ...formik.values,
            calculation: type.slug,
            params: defaultParams(type),
            ...(nameEdited
                ? {}
                : { name: t(`measurements.calculations.names.${type.slug as CalculationSlug}`) }),
            ...(unitEdited ? {} : { unit: type.unit }),
        });
        prefillBigThree(formik, type);
    };

    return {
        pickCalculation: pickCalculation,
        markNameEdited: () => setNameEdited(true),
        markUnitEdited: () => setUnitEdited(true),
    };
};
