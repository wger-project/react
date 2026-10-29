import { MealDetailDropdown } from "@/components/Nutrition/widgets/MealDetailDropdown";
import { useDeleteMealQuery } from "@/components/Nutrition/queries";
import { useAddDiaryEntriesQuery } from "@/components/Nutrition/queries/diary";
import { TEST_MEAL_1 } from "@/tests/nutritionTestdata";
import { TEST_INGREDIENT_1 } from "@/tests/ingredientTestdata";
import { Meal } from "@/components/Nutrition/models/meal";
import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import { mutateMock } from "@/tests/mutationMock";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mock } from "vitest";

vi.mock('@/components/Nutrition/queries');
vi.mock('@/components/Nutrition/queries/diary');

describe('Meal logging actions', () => {
    beforeEach(() => {
        (useDeleteMealQuery as Mock).mockReturnValue({ mutate: mutateMock() });
        (useAddDiaryEntriesQuery as Mock).mockReturnValue({ mutate: mutateMock() });
    });

    test('offers an adjustment flow without immediately logging the saved meal', async () => {
        const user = userEvent.setup();
        render(<MealDetailDropdown
            meal={TEST_MEAL_1}
            planId="plan-1"
            onlyLogging={false}
            isExpanded={false}
            handleExpanded={vi.fn()}
        />);

        await user.click(screen.getByRole('button', { name: 'nutrition.mealActions' }));
        expect(screen.getByRole('menuitem', { name: 'nutrition.adjustAndLog' })).toBeInTheDocument();
    });

    test('opens a prefilled form and discards changes when cancelled and reopened', async () => {
        const user = userEvent.setup();
        const mutate = mutateMock();
        (useAddDiaryEntriesQuery as Mock).mockReturnValue({ mutate });
        render(<MealDetailDropdown meal={TEST_MEAL_1} planId="plan-1" onlyLogging={false}
                                   isExpanded={false} handleExpanded={vi.fn()} />);

        const openForm = async () => {
            await user.click(screen.getByRole('button', { name: 'nutrition.mealActions' }));
            await user.click(screen.getByRole('menuitem', { name: 'nutrition.adjustAndLog' }));
        };
        await openForm();
        const quantity = screen.getByRole('spinbutton', { name: TEST_INGREDIENT_1.name });
        expect(quantity).toHaveValue(120);
        fireEvent.change(quantity, { target: { value: '50' } });
        await user.click(screen.getByRole('button', { name: 'cancel' }));
        await openForm();
        expect(screen.getByRole('spinbutton', { name: TEST_INGREDIENT_1.name })).toHaveValue(120);
        expect(TEST_MEAL_1.items[0].amount).toBe(120);
        expect(mutate).not.toHaveBeenCalled();
    });

    test('quick log keeps the original quantities and confirms only after success', async () => {
        const user = userEvent.setup();
        const mutate = vi.fn();
        (useAddDiaryEntriesQuery as Mock).mockReturnValue({ mutate });
        render(<MealDetailDropdown meal={TEST_MEAL_1} planId="plan-1" onlyLogging={false}
                                   isExpanded={false} handleExpanded={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: 'nutrition.logThisMeal' }));
        expect(mutate).toHaveBeenCalledWith(TEST_MEAL_1.items.map(item => expect.objectContaining({
            amount: item.amount, ingredientId: item.ingredientId, planId: 'plan-1', weightUnitId: item.weightUnitId,
        })), expect.anything());
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        act(() => mutate.mock.calls[0][1].onSuccess());
        expect(screen.getByRole('alert')).toHaveTextContent('nutrition.diaryEntrySaved');
    });

    test.each(['Escape', 'backdrop', 'close icon'])('keeps a pending adjusted save open when dismissed with %s', async dismissal => {
        const user = userEvent.setup();
        const pendingSave = Promise.withResolvers<DiaryEntry[]>();
        const mutate = vi.fn<(entries: DiaryEntry[]) => Promise<DiaryEntry[]>>(() => pendingSave.promise);
        (useAddDiaryEntriesQuery as Mock).mockImplementation(function usePendingDiarySave() {
            return useMutation({ mutationFn: mutate });
        });
        render(<QueryClientProvider client={new QueryClient()}>
            <MealDetailDropdown meal={TEST_MEAL_1} planId="plan-1" onlyLogging={false}
                                isExpanded={false} handleExpanded={vi.fn()} />
        </QueryClientProvider>);
        await user.click(screen.getByRole('button', { name: 'nutrition.mealActions' }));
        await user.click(screen.getByRole('menuitem', { name: 'nutrition.adjustAndLog' }));
        fireEvent.change(screen.getByRole('spinbutton', { name: TEST_INGREDIENT_1.name }), { target: { value: '50' } });
        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        expect(mutate).toHaveBeenCalledOnce();

        await waitFor(() => expect(screen.getByRole('spinbutton', { name: TEST_INGREDIENT_1.name })).toBeDisabled());
        const dismiss = async () => {
            if (dismissal === 'Escape') {
                fireEvent.keyDown(screen.getByRole('spinbutton', { name: TEST_INGREDIENT_1.name }), { key: 'Escape' });
            } else if (dismissal === 'backdrop') {
                await user.click(document.querySelector('.MuiBackdrop-root')!);
            } else {
                await user.click(screen.getByTestId('CloseIcon'));
            }
        };
        await dismiss();
        const amount = screen.getByRole('spinbutton', { name: TEST_INGREDIENT_1.name });
        expect(amount).toHaveValue(50);
        expect(amount).toBeDisabled();
        fireEvent.submit(amount.closest('form')!);
        expect(mutate).toHaveBeenCalledOnce();

        await act(async () => pendingSave.reject(new Error('Meal save failed')));
        await waitFor(() => expect(screen.getByRole('spinbutton', { name: TEST_INGREDIENT_1.name })).toBeEnabled());
        expect(screen.getByRole('spinbutton', { name: TEST_INGREDIENT_1.name })).toHaveValue(50);
        expect(screen.getAllByRole('alert').some(alert => alert.textContent?.includes('Meal save failed'))).toBe(true);
        await dismiss();
        expect(screen.queryByRole('spinbutton', { name: TEST_INGREDIENT_1.name })).not.toBeInTheDocument();
    });

    test('a successful adjusted save closes the pending dialog and shows confirmation', async () => {
        const user = userEvent.setup();
        const pendingSave = Promise.withResolvers<DiaryEntry[]>();
        const mutate = vi.fn<(entries: DiaryEntry[]) => Promise<DiaryEntry[]>>(() => pendingSave.promise);
        (useAddDiaryEntriesQuery as Mock).mockImplementation(function usePendingDiarySave() {
            return useMutation({ mutationFn: mutate });
        });
        render(<QueryClientProvider client={new QueryClient()}>
            <MealDetailDropdown meal={TEST_MEAL_1} planId="plan-1" onlyLogging={false}
                                isExpanded={false} handleExpanded={vi.fn()} />
        </QueryClientProvider>);
        await user.click(screen.getByRole('button', { name: 'nutrition.mealActions' }));
        await user.click(screen.getByRole('menuitem', { name: 'nutrition.adjustAndLog' }));
        await user.click(screen.getByRole('button', { name: 'nutrition.adjustAndLog' }));
        await waitFor(() => expect(screen.getByRole('spinbutton', { name: TEST_INGREDIENT_1.name })).toBeDisabled());
        await act(async () => pendingSave.resolve([]));
        await waitFor(() => expect(screen.queryByRole('spinbutton', { name: TEST_INGREDIENT_1.name })).not.toBeInTheDocument());
        expect(screen.getByRole('alert')).toHaveTextContent('nutrition.diaryEntrySaved');
    });

    test('empty meals cannot be quick logged or adjusted', async () => {
        const user = userEvent.setup();
        render(<MealDetailDropdown meal={Meal.clone(TEST_MEAL_1, { items: [] })} planId="plan-1"
                                   onlyLogging={false} isExpanded={false} handleExpanded={vi.fn()} />);
        expect(screen.getByRole('button', { name: 'nutrition.logThisMeal' })).toBeDisabled();
        await user.click(screen.getByRole('button', { name: 'nutrition.mealActions' }));
        expect(screen.getByRole('menuitem', { name: 'nutrition.adjustAndLog' })).toHaveAttribute('aria-disabled', 'true');
    });

    test('calorie-only plans do not offer a meal-template logging action', async () => {
        const user = userEvent.setup();
        render(<MealDetailDropdown meal={TEST_MEAL_1} planId="plan-1" onlyLogging
                                   isExpanded={false} handleExpanded={vi.fn()} />);
        expect(screen.queryByRole('button', { name: 'nutrition.logThisMeal' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'nutrition.mealActions' }));
        expect(screen.queryByRole('menuitem', { name: 'nutrition.adjustAndLog' })).not.toBeInTheDocument();
    });
});
