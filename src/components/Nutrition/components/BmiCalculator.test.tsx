import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BmiCalculator } from "@/components/Nutrition/components/BmiCalculator";
import { BrowserRouter } from 'react-router-dom';
import { testQueryClient } from "@/tests/queryClient";

// Mock the necessary React Query hooks
vi.mock('@/components/Weight/queries', () => ({
    useBodyWeightQuery: () => ({
        isLoading: false,
        data: [{ weight: 55, date: new Date() }], // Provide mock weight data
    }),
}));

vi.mock('@/components/User/queries/profile', () => ({
    useProfileQuery: () => ({
        isLoading: false,
        data: { height: 180, useMetric: true }, // Provide mock profile data
    }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
        <BrowserRouter>
            {children}
        </BrowserRouter>
    </QueryClientProvider>
);

describe('BmiCalculator', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the component with title and chart', async () => {
        render(<BmiCalculator />, { wrapper });

        expect(screen.getByText('bmi.calculator')).toBeInTheDocument();
        expect(screen.getByText('bmi.result')).toBeInTheDocument();
    });
});