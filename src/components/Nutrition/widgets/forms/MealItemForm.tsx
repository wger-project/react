import { Button, Stack } from "@mui/material";
import { Ingredient } from "@/components/Nutrition/models/Ingredient";
import { MealItem } from "@/components/Nutrition/models/mealItem";
import { NutritionWeightUnit } from "@/components/Nutrition/models/weightUnit";
import {
    useAddMealItemQuery,
    useDeleteMealItemQuery,
    useEditMealItemQuery,
} from "@/components/Nutrition/queries";
import { IngredientAmountFields } from "@/components/Nutrition/widgets/forms/IngredientAmountFields";
import { useAppForm } from "@/core/forms/appForm";
import { yupSchema, submitHandler } from "@/core/forms/formUtils";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from "yup";

type MealItemFormProps =
    | { planId: string; item: MealItem; closeFn?: () => void; mealId?: string }
    | { planId: string; mealId: string; item?: undefined; closeFn?: () => void };

interface MealItemFormValues {
    // The text field hands over strings, the schema casts them to numbers
    amount: string,
    ingredient: number | null,
}

export const MealItemForm = ({ planId, item, mealId, closeFn }: MealItemFormProps) => {

    const [t] = useTranslation();
    const addMealItemQuery = useAddMealItemQuery(planId);
    const editMealItemQuery = useEditMealItemQuery(planId);
    const deleteMealItemQuery = useDeleteMealItemQuery(planId);

    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(item?.ingredient ?? null);
    const [selectedUnit, setSelectedUnit] = useState<NutritionWeightUnit | null>(item?.weightUnit ?? null);

    // The dialog closes only once the server took the change, so a rejected
    // write is shown instead of disappearing with it
    const closeOnSuccess = { onSuccess: () => closeFn?.() };

    const handleDelete = () => {
        if (item) {
            deleteMealItemQuery.mutate(item.id!, closeOnSuccess);
            return;
        }
        closeFn?.();
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

    const defaultValues: MealItemFormValues = {
        amount: String(item ? item.amount : 0),
        ingredient: item ? item.ingredientId : null,
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<MealItemFormValues>(validationSchema) },
        onSubmit: async ({ value }) => {
            // The schema already refused a missing ingredient, this only narrows the type
            if (value.ingredient === null) {
                return;
            }

            // Just to make sure we get a number
            const newAmount = Math.round(Number(value.amount));

            if (item) {
                // Edit
                const newMealItem = MealItem.clone(item, {
                    amount: newAmount,
                    ingredientId: value.ingredient,
                    ingredient: selectedIngredient,
                    weightUnitId: selectedUnit?.id ?? null,
                    weightUnit: selectedUnit,
                });
                editMealItemQuery.mutate(newMealItem, closeOnSuccess);
            } else {
                // Add
                addMealItemQuery.mutate(new MealItem({
                    mealId: mealId!,
                    amount: newAmount,
                    ingredientId: value.ingredient,
                    weightUnitId: selectedUnit?.id ?? null,
                    weightUnit: selectedUnit,
                    order: 1,
                }), closeOnSuccess);
            }
        },
    });

    return (
        <form onSubmit={submitHandler(form)}>
            <Stack spacing={2}>
                <form.Subscribe selector={state => state.values.amount}>
                    {amount => <IngredientAmountFields
                        ingredient={selectedIngredient}
                        onIngredientChange={(value: Ingredient | null) => {
                            form.setFieldValue('ingredient', value ? value.id : null);
                            setSelectedIngredient(value);
                        }}
                        weightUnit={selectedUnit}
                        onWeightUnitChange={setSelectedUnit}
                        amount={Number(amount)}
                        renderAmountField={endAdornment => <form.AppField name="amount">
                            {field => <field.WgerTextField
                                title={'amount'}
                                fieldProps={{
                                    slotProps: {
                                        input: { endAdornment },
                                        htmlInput: { inputMode: 'decimal' }
                                    },
                                }}
                            />}
                        </form.AppField>}
                    />}
                </form.Subscribe>

                <FormQueryErrors mutationQuery={item ? editMealItemQuery : addMealItemQuery} />
                <FormQueryErrors mutationQuery={deleteMealItemQuery} />
                <Stack direction="row" spacing={2} sx={{ justifyContent: "end" }}>
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
        </form>
    );
};
