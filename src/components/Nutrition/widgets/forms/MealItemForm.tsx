import { Button, InputAdornment, MenuItem, Select, Stack, TextField } from "@mui/material";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { MealItem } from "components/Nutrition/models/mealItem";
import { NutritionWeightUnit } from "components/Nutrition/models/weightUnit";
import {
    useAddMealItemQuery,
    useDeleteMealItemQuery,
    useEditMealItemQuery,
    useFetchWeightUnitsQuery
} from "components/Nutrition/queries";
import { IngredientAutocompleter } from "components/Nutrition/widgets/IngredientAutcompleter";
import { Form, Formik } from "formik";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from "yup";

const GRAM_UNIT_VALUE = 'g';

type MealItemFormProps =
    | { planId: number; item: MealItem; closeFn?: () => void; mealId?: number }
    | { planId: number; mealId: number; item?: undefined; closeFn?: () => void };

export const MealItemForm = ({ planId, item, mealId, closeFn }: MealItemFormProps) => {

    const [t] = useTranslation();
    const addMealItemQuery = useAddMealItemQuery(planId);
    const editMealItemQuery = useEditMealItemQuery(planId);
    const deleteMealItemQuery = useDeleteMealItemQuery(planId);

    const [selectedUnit, setSelectedUnit] = useState<NutritionWeightUnit | null>(item?.weightUnit ?? null);
    const [ingredientId, setIngredientId] = useState<number | null>(item?.ingredientId ?? null);

    const weightUnitsQuery = useFetchWeightUnitsQuery(ingredientId);
    const weightUnits = weightUnitsQuery.data ?? [];

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

    const handleUnitChange = (value: string) => {
        if (value === GRAM_UNIT_VALUE) {
            setSelectedUnit(null);
        } else {
            const unit = weightUnits.find(u => u.id === Number(value));
            setSelectedUnit(unit ?? null);
        }
    };

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
                        weightUnitId: selectedUnit?.id ?? null,
                        weightUnit: selectedUnit,
                    });
                    editMealItemQuery.mutate(newMealItem);
                } else {
                    // Add
                    addMealItemQuery.mutate(new MealItem({
                        mealId: mealId,
                        amount: newAmount,
                        ingredientId: values.ingredient,
                        weightUnitId: selectedUnit?.id ?? null,
                        weightUnit: selectedUnit,
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
                            callback={(value: Ingredient | null) => {
                                formik.setFieldValue('ingredient', value ? value.id : null);
                                setIngredientId(value?.id ?? null);
                                setSelectedUnit(null);
                            }}
                            initialIngredient={item ? item.ingredient : null}
                        />
                        <TextField
                            fullWidth
                            id="amount"
                            label={'amount'}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {weightUnits.length > 0 ? (
                                                <Select
                                                    variant="standard"
                                                    disableUnderline
                                                    value={selectedUnit?.id?.toString() ?? GRAM_UNIT_VALUE}
                                                    onChange={(e) => handleUnitChange(e.target.value)}
                                                >
                                                    <MenuItem value={GRAM_UNIT_VALUE}>
                                                        {t('nutrition.gramShort')}
                                                    </MenuItem>
                                                    {weightUnits.map(unit => (
                                                        <MenuItem key={unit.id} value={unit.id.toString()}>
                                                            {unit.name} ({unit.grams}g)
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            ) : (
                                                t('nutrition.gramShort')
                                            )}
                                        </InputAdornment>
                                    )
                                }
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
