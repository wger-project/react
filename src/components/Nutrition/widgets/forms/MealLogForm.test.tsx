import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import { Meal } from "@/components/Nutrition/models/meal";
import { MealItem } from "@/components/Nutrition/models/mealItem";
import { useAddDiaryEntriesQuery } from "@/components/Nutrition/queries/diary";
import { MealLogForm } from "@/components/Nutrition/widgets/forms/MealLogForm";
import { numberLocale } from "@/core/lib/numbers";
import { TEST_INGREDIENT_1, TEST_INGREDIENT_2 } from "@/tests/ingredientTestdata";
import { mutateMock } from "@/tests/mutationMock";
import { TEST_DIARY_ENTRY_1 } from "@/tests/nutritionDiaryTestdata";
import { TEST_MEAL_1, TEST_MEAL_ITEM_1, TEST_MEAL_ITEM_2, TEST_WEIGHT_UNIT_SLICE } from "@/tests/nutritionTestdata";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import type { Mock } from "vitest";

vi.mock('@/components/Nutrition/queries/diary');

describe('Adjusting a meal before logging it', () => {
    let meal: Meal;
    let mutate: ReturnType<typeof mutateMock>;
    let closeFn: Mock<() => void>;
    let onSuccess: Mock<() => void>;

    beforeEach(() => {
        meal = Meal.clone(TEST_MEAL_1, {
            items: [
                MealItem.clone(TEST_MEAL_ITEM_1, { amount: 100 }),
                MealItem.clone(TEST_MEAL_ITEM_2, { amount: 2, weightUnit: TEST_WEIGHT_UNIT_SLICE }),
            ],
            diaryEntries: [DiaryEntry.clone(TEST_DIARY_ENTRY_1)],
        });
        mutate = mutateMock();
        closeFn = vi.fn();
        onSuccess = vi.fn();
        (useAddDiaryEntriesQuery as Mock).mockReturnValue({ mutate, isPending: false });
    });

    const Form = ({ value = meal }: { value?: Meal }) => <MealLogForm
        meal={value} planId="plan-1" closeFn={closeFn} onSuccess={onSuccess}
        addDiaryEntriesQuery={useAddDiaryEntriesQuery('plan-1')}
    />;
    const form = () => <Form />;
    const firstAmount = () => screen.getByRole('spinbutton', { name: TEST_INGREDIENT_1.name });
    const secondAmount = () => screen.getByRole('spinbutton', { name: TEST_INGREDIENT_2.name });

    test('starts with the saved quantities and keeps the ingredient units', () => {
        render(form());
        expect(firstAmount()).toHaveValue(100);
        expect(secondAmount()).toHaveValue(2);
        expect(screen.getByText(`× ${TEST_WEIGHT_UNIT_SLICE.name}`)).toBeInTheDocument();
        expect(screen.getAllByRole('slider')).toHaveLength(2);
        expect(mutate).not.toHaveBeenCalled();
    });

    test('changing one quantity updates the preview and logs fresh entries without editing the template or history', async () => {
        const user = userEvent.setup();
        const savedMeal = JSON.stringify(meal);
        render(form());

        fireEvent.change(firstAmount(), { target: { value: '150' } });
        expect(secondAmount()).toHaveValue(2);
        const preview = screen.getByLabelText('nutrition.adjustedNutrition');
        // 150 g of the first product + two 50 g slices of the second product.
        const energy = TEST_INGREDIENT_1.energy * 1.5 + TEST_INGREDIENT_2.energy;
        expect(within(preview).getByText(numberLocale(energy, i18n.language), { exact: false })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        expect(mutate).toHaveBeenCalledTimes(1);
        const entries = mutate.mock.calls[0][0] as DiaryEntry[];
        expect(entries).toHaveLength(2);
        expect(entries[0]).toMatchObject({ amount: 150, ingredientId: TEST_INGREDIENT_1.id, planId: 'plan-1', weightUnitId: null });
        expect(entries[1]).toMatchObject({ amount: 2, ingredientId: TEST_INGREDIENT_2.id, planId: 'plan-1', weightUnitId: TEST_WEIGHT_UNIT_SLICE.id });
        expect(entries[1].toJson()).toMatchObject({
            amount: '2', ingredient: TEST_INGREDIENT_2.id, plan: 'plan-1',
            weight_unit: TEST_WEIGHT_UNIT_SLICE.id, meal: meal.items[1].mealId,
        });
        expect(entries[0].datetime).toBeInstanceOf(Date);
        expect(entries[0].datetime).toEqual(entries[1].datetime);
        expect(entries.every(entry => entry.id === null && entry.mealId === meal.items[0].mealId)).toBe(true);
        expect(JSON.stringify(meal)).toBe(savedMeal);
        expect(closeFn).toHaveBeenCalledOnce();
        expect(onSuccess).toHaveBeenCalledOnce();
    });

    test('an ingredient portion slider changes only that ingredient', async () => {
        const user = userEvent.setup();
        render(form());
        fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '50' } });
        expect(firstAmount()).toHaveValue(50);
        expect(secondAmount()).toHaveValue(2);
        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        expect((mutate.mock.calls[0][0] as DiaryEntry[]).map(entry => entry.amount)).toEqual([50, 2]);
        expect(meal.items.map(item => item.amount)).toEqual([100, 2]);
    });

    test('zero omits an ingredient while retaining the other ingredient and its units', async () => {
        const user = userEvent.setup();
        render(form());
        fireEvent.change(firstAmount(), { target: { value: '0' } });
        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        const entries = mutate.mock.calls[0][0] as DiaryEntry[];
        expect(entries).toHaveLength(1);
        expect(entries[0]).toMatchObject({ amount: 2, ingredientId: TEST_INGREDIENT_2.id, weightUnitId: TEST_WEIGHT_UNIT_SLICE.id });
    });

    test('all zero quantities cannot create an empty batch', async () => {
        const user = userEvent.setup();
        render(form());
        fireEvent.change(firstAmount(), { target: { value: '0' } });
        fireEvent.change(secondAmount(), { target: { value: '0' } });
        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        expect(await screen.findByText('nutrition.mealAmountRequired')).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });

    test.each(['', '-1', '0.5', '1000.01', '1.234', '1.0000000001', '150.0000000001', '1e309'])('rejects invalid quantity %j without closing the form', async amount => {
        const user = userEvent.setup();
        render(form());
        fireEvent.change(firstAmount(), { target: { value: amount } });
        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        expect(screen.getByText(/forms\.(fieldRequired|enterNumber|minValue|maxValue)|nutrition.amountPrecision/)).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
        expect(closeFn).not.toHaveBeenCalled();
    });

    test.each(['1.01', '1.1', '150.29', '250.25', '1000'])('accepts valid quantity %s without changing its serialized value', async amount => {
        const user = userEvent.setup();
        render(form());
        fireEvent.change(firstAmount(), { target: { value: amount } });
        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        const entry = (mutate.mock.calls[0][0] as DiaryEntry[])[0];
        expect(entry.amount).toBe(Number(amount));
        expect(entry.toJson().amount).toBe(amount);
    });

    test('cancel leaves saved quantities and history intact and creates no entries', async () => {
        const user = userEvent.setup();
        const savedMeal = JSON.stringify(meal);
        render(form());
        fireEvent.change(firstAmount(), { target: { value: '50' } });
        await user.click(screen.getByRole('button', { name: 'cancel' }));
        expect(closeFn).toHaveBeenCalledOnce();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(mutate).not.toHaveBeenCalled();
        expect(JSON.stringify(meal)).toBe(savedMeal);
    });

    test('a rejected save stays open and shows the server error', async () => {
        const user = userEvent.setup();
        const pendingMutation = vi.fn();
        (useAddDiaryEntriesQuery as Mock).mockReturnValue({ mutate: pendingMutation, isPending: false });
        const view = render(form());
        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        expect(closeFn).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        (useAddDiaryEntriesQuery as Mock).mockReturnValue({
            mutate: pendingMutation,
            isError: true,
            error: { message: 'Could not save meal', response: { data: { detail: 'Try again later' } } },
        });
        view.rerender(form());
        expect(screen.getByRole('alert')).toHaveTextContent('Could not save meal');
        expect(firstAmount()).toHaveValue(100);
    });

    test('pending saves disable quantity changes and repeated submissions', () => {
        (useAddDiaryEntriesQuery as Mock).mockReturnValue({ mutate, isPending: true });
        render(form());
        expect(firstAmount()).toBeDisabled();
        expect(secondAmount()).toBeDisabled();
        const submit = screen.getByRole('button', { name: 'nutrition.adjustAndLog' });
        expect(submit).toBeDisabled();
        fireEvent.submit(submit.closest('form')!);
        expect(mutate).not.toHaveBeenCalled();
    });

    test('an empty meal cannot be logged', () => {
        meal = Meal.clone(meal, { items: [] });
        render(form());
        expect(screen.getByText('nutrition.noIngredientsDefined')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'nutrition.adjustAndLog' })).toBeDisabled();
        expect(mutate).not.toHaveBeenCalled();
    });

    test('a template refresh cannot assign draft quantities to different ingredients', async () => {
        const user = userEvent.setup();
        const view = render(form());
        fireEvent.change(firstAmount(), { target: { value: '50' } });
        const refreshedMeal = Meal.clone(meal, { items: [...meal.items].reverse() });
        view.rerender(<Form value={refreshedMeal} />);
        expect(firstAmount()).toHaveValue(50);
        expect(secondAmount()).toHaveValue(2);
        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        const entries = mutate.mock.calls[0][0] as DiaryEntry[];
        expect(entries.find(entry => entry.ingredientId === TEST_INGREDIENT_1.id)?.amount).toBe(50);
        expect(entries.find(entry => entry.ingredientId === TEST_INGREDIENT_2.id)?.amount).toBe(2);
    });

    test('a manually entered future date cannot be logged', async () => {
        const user = userEvent.setup();
        render(form());
        const year = screen.getByRole('spinbutton', { name: 'Year' });
        await user.click(year);
        await user.keyboard(String(new Date().getFullYear() + 1));
        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        expect(mutate).not.toHaveBeenCalled();
        expect(screen.getByText('nutrition.pastDateRequired')).toBeInTheDocument();
    });
});
