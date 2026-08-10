import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { testUserProgressionTrophies } from "@/tests/trophies/trophiesTestData";
import { useUserTrophyProgressionQuery } from "@/components/Trophies/queries/trophies";
import { TrophiesDetail } from './TrophiesDetail';
import type { Mock } from 'vitest';

vi.mock('@/components/Trophies/queries/trophies');

describe('TrophiesDetail', () => {

    beforeEach(() => {
        (useUserTrophyProgressionQuery as Mock).mockReturnValue({
            isLoading: false,
            isSuccess: true,
            data: testUserProgressionTrophies(),
        });
    });

    test('renders trophy names and progression values', () => {

        // Act
        render(<TrophiesDetail />);

        // Assert
        expect(screen.getByText('Beginner')).toBeInTheDocument();
        expect(screen.getByText('Unstoppable')).toBeInTheDocument();
        expect(screen.getByText('Complete your first workout')).toBeInTheDocument();
        expect(screen.getByText('Maintain a 30-day workout streak')).toBeInTheDocument();

        // Progression value for the progressive trophy should be shown
        expect(screen.getByText('4/30')).toBeInTheDocument();

        // There should be at least one progressbar in the document
        expect(screen.getAllByRole('progressbar').length).toBeGreaterThanOrEqual(1);
    });

    test('renders an empty overview instead of crashing when the query failed', () => {

        // Arrange
        (useUserTrophyProgressionQuery as Mock).mockReturnValue({
            isLoading: false,
            isSuccess: false,
            isError: true,
            data: undefined,
        });

        // Act
        render(<TrophiesDetail />);

        // Assert
        expect(screen.getByText('trophies.trophies')).toBeInTheDocument();
        expect(screen.queryByText('Beginner')).not.toBeInTheDocument();
    });

    test('shows the loading placeholder while the query runs', () => {

        // Arrange
        (useUserTrophyProgressionQuery as Mock).mockReturnValue({
            isLoading: true,
            isSuccess: false,
            data: undefined,
        });

        // Act
        render(<TrophiesDetail />);

        // Assert
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByText('trophies.trophies')).not.toBeInTheDocument();
    });
});
