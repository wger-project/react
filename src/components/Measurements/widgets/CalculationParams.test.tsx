import { calculationType } from "@/components/Measurements/models/Calculation";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { CalculationParams } from "@/components/Measurements/widgets/CalculationParams";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from 'react';

vi.mock("@/components/Exercises", async (importOriginal) => ({
    ...await importOriginal<typeof import("@/components/Exercises")>(),
    useLanguageQuery: vi.fn(() => ({ isSuccess: true, data: [] })),
    useExercisesDetailQueries: vi.fn((ids: number[]) => ids.map(id => ({
        data: { id: id, getTranslation: () => ({ name: `Exercise ${id}` }) },
    }))),
    usePrimeExercise: vi.fn(() => vi.fn()),
}));
// The autocompleter reads the language list from the module directly
vi.mock("@/components/Exercises/queries", async (importOriginal) => ({
    ...await importOriginal<typeof import("@/components/Exercises/queries")>(),
    useLanguageQuery: vi.fn(() => ({ isSuccess: true, data: [] })),
}));

const WHTR = calculationType('WHTR')!;
const ONE_REP_MAX = calculationType('ONE_REP_MAX')!;

const category = (id: string, name: string, unit: string) =>
    new MeasurementCategory(id, name, unit);

const renderParams = (props: {
    type?: typeof WHTR,
    categories?: MeasurementCategory[],
    params?: Record<string, unknown>,
    onChange?: (params: Record<string, unknown>) => void,
}) => render(
    <QueryClientProvider client={new QueryClient()}>
        <CalculationParams
            type={props.type ?? WHTR}
            params={props.params ?? {}}
            onChange={props.onChange ?? vi.fn()}
            categories={props.categories ?? []}
            categoryId={'c-self'}
        />
    </QueryClientProvider>
);

describe('The parameters of a calculation', () => {

    test('says so when there is no other category to read from', () => {
        renderParams({ categories: [] });

        expect(screen.getByText('measurements.calculations.noSourceCategory')).toBeInTheDocument();
        expect(screen.queryByLabelText('measurements.calculations.params.category_id'))
            .not.toBeInTheDocument();
    });

    test('a category whose unit it cannot read is shown, but cannot be picked', async () => {
        const user = userEvent.setup();
        const calculated = category('c-4', 'Waist to height', '');
        calculated.dynamicType = 'WHTR';

        renderParams({
            categories: [
                category('c-1', 'Waist', 'cm'),
                category('c-2', 'Chest', 'inches'),
                category('c-3', 'Bauch', 'Zentimeter'),
                calculated,
                // the category being configured cannot read itself
                category('c-self', 'Self', 'cm'),
            ],
        });
        await user.click(screen.getByLabelText('measurements.calculations.params.category_id'));

        // The unit next to the name is what the user has to change, so the
        // category is offered rather than hidden
        expect(screen.getByRole('option', { name: 'Waist (cm)' })).not.toHaveAttribute('aria-disabled');
        expect(screen.getByRole('option', { name: 'Chest (inches)' })).not.toHaveAttribute('aria-disabled');
        expect(screen.getByRole('option', { name: 'Bauch (Zentimeter)' }))
            .toHaveAttribute('aria-disabled', 'true');

        // A calculated category and the one being configured are not sources
        expect(screen.queryByRole('option', { name: /Waist to height/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('option', { name: /Self/ })).not.toBeInTheDocument();
    });

    test('the usual spellings of a length count as the same unit', async () => {
        const user = userEvent.setup();
        renderParams({
            categories: [
                category('c-1', 'Waist', ' CM. '),
                category('c-2', 'Chest', 'Centimeters'),
                category('c-3', 'Arm', '"'),
                category('c-4', 'Hip', 'mm'),
                category('c-5', 'Leg', 'm'),
            ],
        });
        await user.click(screen.getByLabelText('measurements.calculations.params.category_id'));

        for (const name of [
            'Waist ( CM. )', 'Chest (Centimeters)', 'Arm (")', 'Hip (mm)', 'Leg (m)',
        ]) {
            expect(screen.getByRole('option', { name })).not.toHaveAttribute('aria-disabled');
        }
    });

    test('a number that is cleared stays empty, which means the server default', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderParams({
            type: ONE_REP_MAX,
            params: { exercise_id: 1, max_reps: 5 },
            onChange: onChange,
        });

        await user.clear(screen.getByLabelText('measurements.calculations.params.max_reps'));

        expect(onChange).toHaveBeenCalledWith({ exercise_id: 1 });
    });
});
