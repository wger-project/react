import { Button } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { WgerTextField } from "components/Common/forms/WgerTextField";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { useAddRoutineQuery, useEditRoutineQuery } from "components/WorkoutRoutines/queries/routines";
import { Form, Formik } from "formik";
import React from 'react';
import { useTranslation } from "react-i18next";
import { dateToYYYYMMDD } from "utils/date";
import * as yup from 'yup';

interface RoutineFormProps {
    routine?: Routine,
    closeFn?: Function,
}

export const RoutineForm = ({ routine, closeFn }: RoutineFormProps) => {

    const [t] = useTranslation();
    const addRoutineQuery = useAddRoutineQuery();
    const editRoutineQuery = useEditRoutineQuery(routine?.id!);
    const validationSchema = yup.object({
        name: yup
            .string()
            .required()
            .max(25, t('forms.maxLength', { chars: '25' }))
            .min(3, t('forms.minLength', { chars: '3' })),
        description: yup
            .string()
            .max(25, t('forms.maxLength', { chars: '1000' })),
        start: yup
            .date()
            .required(),
        end: yup
            .date()
            .required()
    });


    return (
        (<Formik
            initialValues={{
                name: routine ? routine.name : '',
                description: routine ? routine.description : '',
                start: routine ? routine.start : dateToYYYYMMDD(new Date()),
                end: routine ? routine.end : dateToYYYYMMDD(new Date()),
                // eslint-disable-next-line camelcase
            }}

            validationSchema={validationSchema}
            onSubmit={async (values) => {

                if (routine) {
                    editRoutineQuery.mutate({ ...values, id: routine.id });
                } else {
                    addRoutineQuery.mutate(values);
                }

                // if closeFn is defined, close the modal (this form does not have to be displayed in one)
                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Grid container>
                        <Grid size={6}>
                            <WgerTextField fieldName="name" title={t('name')} />
                        </Grid>
                        <Grid size={3}>
                            <WgerTextField fieldName="start" title={'start'} />
                        </Grid>
                        <Grid size={3}>
                            <WgerTextField fieldName="end" title={'end'} />
                        </Grid>
                        <Grid size={12}>
                            <WgerTextField fieldName="description" title={t('description')} />
                        </Grid>
                        <Grid size={12}>
                            <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Grid>

                    </Grid>
                </Form>
            )}
        </Formik>)
    );
};
