import { ExerciseAnalyticsChart } from "@/components/Routines/widgets/ExerciseAnalyticsChart";
import { render, screen, within } from '@testing-library/react';

test('table distinguishes missing days from zero and keeps equally named exercises separate', () => {
    render(<ExerciseAnalyticsChart table unit="kg" series={[
        { key: '1-kg', exerciseId: 1, name: 'Same name', unit: 'kg', points: [
            { date: new Date(2026, 5, 1).getTime(), value: 0 },
        ] },
        { key: '2-kg', exerciseId: 2, name: 'Same name', unit: 'kg', points: [
            { date: new Date(2026, 5, 2).getTime(), value: 45.359237 },
        ] },
    ]} />);
    const rows = within(screen.getByRole('table', { name: 'kg' })).getAllByRole('row');
    expect(within(rows[0]).getAllByRole('columnheader', { name: 'Same name (kg)' })).toHaveLength(2);
    expect(within(rows[1]).getByRole('cell', { name: '0' })).toBeInTheDocument();
    expect(within(rows[1]).getByRole('cell', { name: '—' })).toBeInTheDocument();
    expect(within(rows[2]).getByRole('cell', { name: '45.36' })).toBeInTheDocument();
});
