import { Button, InputAdornment, Stack, TextField } from "@mui/material";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { MealItem } from "components/Nutrition/models/mealItem";
import { useAddMealItemQuery, useDeleteMealItemQuery, useEditMealItemQuery } from "components/Nutrition/queries";
import { IngredientAutocompleter } from "components/Nutrition/widgets/IngredientAutcompleter";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import * as yup from "yup";

type MealItemFormProps =
    | { planId: number; item: MealItem; closeFn?: () => void; mealId?: number }
    | { planId: number; mealId: number; item?: undefined; closeFn?: () => void };

export const MealItemForm = ({ planId, item, mealId, closeFn }: MealItemFormProps) => {

    const [t] = useTranslation();
    const addMealItemQuery = useAddMealItemQuery(planId);
    const editMealItemQuery = useEditMealItemQuery(planId);
    const deleteMealItemQuery = useDeleteMealItemQuery(planId);

    const handleDelete = () => {
        if (item) {
            deleteMealItemQuery.mutate(item.id!);
        }

        if (closeFn) {
            closeFn();
        }
    };

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
                amount: item ? item.amount : 0,
                ingredient: item ? item.ingredientId : 0,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // Just to make sure we get a number
                const newAmount = Math.round(values.amount);

                if (item) {
                    // Edit
                    const newMealItem = MealItem.clone(item, {
                        amount: newAmount,
                        ingredientId: values.ingredient,
                        weightUnitId: null,
                    });
                    editMealItemQuery.mutate(newMealItem);
                } else {
                    // Add
                    addMealItemQuery.mutate(new MealItem({
                        mealId: mealId,
                        amount: newAmount,
                        ingredientId: values.ingredient,
                        order: 1,
                    }));
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
                            callback={(value: Ingredient | null) => formik.setFieldValue('ingredient', value ? value.id : null)}
                            initialIngredient={item ? item.ingredient : null}
                        />
                        <TextField
                            fullWidth
                            id="amount"
                            label={'amount'}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{t('nutrition.gramShort')}</InputAdornment>
                            }}

                            error={formik.touched.amount && Boolean(formik.errors.amount)}
                            helperText={formik.touched.amount && formik.errors.amount}
                            {...formik.getFieldProps('amount')}
                        />

                        <Stack direction="row" justifyContent="end" spacing={2}>
                            {(closeFn !== undefined && item !== undefined)
                                && <Button color="error" variant="outlined" onClick={handleDelete}>
                                    {t('delete')}
                                </Button>}

                            {closeFn !== undefined
                                && <Button color="primary" variant="outlined" onClick={() => closeFn()}>
                                    {t('close')}
                                </Button>}

                            <Button color="primary" variant="contained" type="submit">
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};
