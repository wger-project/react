import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { testUserProgressionTrophies } from "tests/trophies/trophiesTestData";
import { TrophiesDetail } from './TrophiesDetail';


// Mock the trophies query hook
jest.mock('components/Trophies/queries/trophies', () => ({
    useUserTrophyProgressionQuery: () => ({
        isLoading: false,
        data: testUserProgressionTrophies(),
    }),
}));

describe('TrophiesDetail', () => {
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
});
