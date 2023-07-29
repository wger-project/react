import { Button, Stack, TextField } from "@mui/material";
import { MealItem } from "components/Nutrition/models/mealItem";
import { useAddMealItemQuery, useEditMealItemQuery } from "components/Nutrition/queries";
import { IngredientAutocompleter } from "components/Nutrition/widgets/IngredientAutcompleter";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import { IngredientSearchResponse } from "services/responseType";
import * as yup from "yup";

type MealItemFormProps = {
    planId: number,
    mealId: number,
    item?: MealItem,
    closeFn?: Function,
}

export const MealItemForm = ({ planId, item, mealId, closeFn }: MealItemFormProps) => {

    const [t] = useTranslation();
    const addMealItemQuery = useAddMealItemQuery(planId);
    const editMealItemQuery = useEditMealItemQuery(planId);
    const validationSchema = yup.object({
        amount: yup
            .number()
            .required(t('forms.fieldRequired'))
            .max(1000, t('forms.maxValue', { value: '1000' }))
            .min(1, t('forms.minValue', { value: '1' })),
        ingredient: yup
            .number()
            .required(t('forms.fieldRequired')),
    });


    return (
        <Formik
            initialValues={{
                amount: 0,
                ingredient: 0,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                const data = {
                    ...values,
                    meal: mealId,
                    // eslint-disable-next-line camelcase
                    weight_unit: null
                };

                if (item) {
                    editMealItemQuery.mutate({ ...data, id: item.id });
                } else {
                    addMealItemQuery.mutate(data);
                }

                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        <IngredientAutocompleter
                            callback={(value: IngredientSearchResponse) => formik.setFieldValue('ingredient', value.data.id)} />
                        <TextField
                            fullWidth
                            id="amount"
                            label={'amount'}
                            error={formik.touched.amount && Boolean(formik.errors.amount)}
                            helperText={formik.touched.amount && formik.errors.amount}
                            {...formik.getFieldProps('amount')}
                        />

                        <Stack direction="row" justifyContent="end" sx={{ mt: 2 }}>
                            <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};
