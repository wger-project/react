import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BmiCalculator } from "@/components/Nutrition/screens/BmiCalculator";
import { useBodyWeightQuery } from "@/components/Weight";
import { useProfileQuery } from "@/components/User";
import i18n from 'i18next';
import { BrowserRouter } from 'react-router-dom';
import { testQueryClient } from "@/tests/queryClient";
import type { Mock } from 'vitest';

vi.mock('@/components/Weight/queries');
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
            data: [{ weight: 55, date: new Date() }],
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

    it('converts the last weight entry to kg for imperial users', async () => {
        (useProfileQuery as Mock).mockReturnValue({
            isLoading: false,
            data: { height: 180, useMetric: false },
        });

        render(<BmiCalculator />, { wrapper });

        // 55 lb are 24.947 kg, which gives a BMI of 7.699...
        expect(screen.getByLabelText('weight')).toHaveValue(55 * 0.453592);
        expect(screen.getByText('BMI: 7.7')).toBeInTheDocument();
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
