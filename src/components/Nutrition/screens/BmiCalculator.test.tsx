import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { useBodyWeightCategoryQuery, useBodyWeightQuery } from "@/components/Measurements";
import { BmiCalculator } from "@/components/Nutrition/screens/BmiCalculator";
import { useProfileQuery } from "@/components/User";
import i18n from 'i18next';
import { BrowserRouter } from 'react-router-dom';
import { testQueryClient } from "@/tests/queryClient";
import { makeWeightEntry, testBodyWeightCategory } from "@/tests/weight/testData";
import type { Mock } from 'vitest';

vi.mock('@/components/Measurements/queries/bodyWeight');
vi.mock('@/components/User/queries/profile');

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
        <BrowserRouter>
            {children}
        </BrowserRouter>
    </QueryClientProvider>
);

describe('BmiCalculator', () => {

    beforeAll(() => {
        // The result is only readable with an interpolated translation, the test
        // setup otherwise initialises i18next without any resources
        i18n.addResource('en', 'translations', 'bmi.result', 'BMI: {{value}}');
    });

    afterAll(() => {
        i18n.removeResourceBundle('en', 'translations');
    });

    beforeEach(() => {
        (useBodyWeightQuery as Mock).mockReturnValue({
            isLoading: false,
            data: [makeWeightEntry(new Date(), 55)],
        });
        (useBodyWeightCategoryQuery as Mock).mockReturnValue({
            isLoading: false,
            data: testBodyWeightCategory,
        });
        (useProfileQuery as Mock).mockReturnValue({
            isLoading: false,
            data: { height: 180, useMetric: true },
        });
    });

    it('renders the component with title and chart', async () => {
        render(<BmiCalculator />, { wrapper });

        expect(screen.getByText('bmi.calculator')).toBeInTheDocument();
        expect(screen.getByLabelText('height')).toBeInTheDocument();
        expect(screen.getByLabelText('weight')).toBeInTheDocument();
    });

    it('calculates the BMI from the last weight entry and the profile height', async () => {
        render(<BmiCalculator />, { wrapper });

        // 55 kg / 1.80 m² = 16.975...
        expect(screen.getByText('BMI: 17.0')).toBeInTheDocument();
        expect(screen.getByLabelText('weight')).toHaveValue(55);
        expect(screen.getByLabelText('height')).toHaveValue(180);
    });

    it('converts an entry stored in pounds to kg', async () => {
        // The unit travels with the entry, so the profile has no say in this
        (useBodyWeightQuery as Mock).mockReturnValue({
            isLoading: false,
            data: [makeWeightEntry(new Date(), 121, { unit: 'lb' })],
        });

        render(<BmiCalculator />, { wrapper });

        // 121 lb are 54.88 kg, which gives a BMI of 16.938...
        expect(screen.getByLabelText('weight')).toHaveValue(54.88);
        expect(screen.getByText('BMI: 16.9')).toBeInTheDocument();
    });

    it('shows no result when the user has no weight entries', async () => {
        (useBodyWeightQuery as Mock).mockReturnValue({
            isLoading: false,
            data: [],
        });

        render(<BmiCalculator />, { wrapper });

        expect(screen.queryByText(/^BMI:/)).not.toBeInTheDocument();
    });

    it('shows the loading placeholder while the queries run', async () => {
        (useProfileQuery as Mock).mockReturnValue({ isLoading: true, data: undefined });

        render(<BmiCalculator />, { wrapper });

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByText('bmi.calculator')).not.toBeInTheDocument();
    });
});
