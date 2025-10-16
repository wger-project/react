import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { FilterButtons, FilterType } from './FilterButtons';

describe('FilterButtons Component', () => {
    const onFilterChange = jest.fn();

    const renderComponent = (currentFilter: FilterType) => {
        render(
            <FilterButtons
                currentFilter={currentFilter}
                onFilterChange={onFilterChange}
            />
        );
    };

    afterEach(() => {
        onFilterChange.mockClear();
    });

    test('renders all filter buttons', () => {
        renderComponent('');
        const buttonLabels = ['all', 'lastYear', 'lastHalfYear', 'lastMonth', 'lastWeek'];
        buttonLabels.forEach(label => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });

    test('applies primary color and contained variant to the active filter button', () => {
        renderComponent('lastMonth');
        const activeButton = screen.getByText('lastMonth');
        expect(activeButton).toHaveClass('MuiButton-containedPrimary');
    });

    test('calls onFilterChange with correct value when a button is clicked', () => {
        renderComponent('');
        const lastYearButton = screen.getByText('lastYear');

        fireEvent.click(lastYearButton);
        expect(onFilterChange).toHaveBeenCalledWith('lastYear');
    });

    test('does not trigger onFilterChange when clicking the currently active filter button', () => {
        renderComponent('lastYear');
        const lastYearButton = screen.getByText('lastYear');

        fireEvent.click(lastYearButton);
        expect(onFilterChange).not.toHaveBeenCalled();
    });

    test('displays correct default style for inactive filter buttons', () => {
        renderComponent('');
        const inactiveButton = screen.getByText('lastYear');
        expect(inactiveButton).toHaveClass('MuiButton-outlined');
    });
});
