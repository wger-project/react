import { IngredientDetailTable } from './IngredientDetailTable';
import { TEST_DIARY_ENTRY_1 } from '@/tests/nutritionDiaryTestdata';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('./forms/NutritionDiaryEntryForm', () => ({
    NutritionDiaryEntryForm: ({ onPendingChange }: { onPendingChange?: (pending: boolean) => void }) =>
        <div>Portion editor<button onClick={() => onPendingChange?.(true)}>Start save</button></div>,
}));

test('the explicit Edit action opens the diary editor by keyboard', async () => {
    const user = userEvent.setup();
    render(<IngredientDetailTable items={[TEST_DIARY_ENTRY_1]}
        values={TEST_DIARY_ENTRY_1.nutritionalValues} showSum={false}
        planId={TEST_DIARY_ENTRY_1.planId} />);
    const edit = screen.getByRole('button', { name: 'edit' });
    edit.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Portion editor')).toBeInTheDocument();
    expect(edit).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Start save' }));
    expect(edit).toBeDisabled();
    await user.click(screen.getByText(/0% fat Greek style yogurt/));
    expect(screen.getByText('Portion editor')).toBeInTheDocument();
});
