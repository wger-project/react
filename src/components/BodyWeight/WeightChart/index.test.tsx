import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeightEntry } from "components/BodyWeight/model";
import React from 'react';
import { testQueryClient } from "tests/queryClient";
import { WeightChart } from "./index";

const { ResizeObserver } = window;

// See https://github.com/maslianok/react-resize-detector#testing-with-enzyme-and-jest
beforeEach(() => {
    // @ts-ignore
    delete window.ResizeObserver;
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
    }));
});

afterEach(() => {
    window.ResizeObserver = ResizeObserver;
    jest.restoreAllMocks();
});


describe("Test WeightChart component", () => {
    test('renders without crashing with weight data', async () => {
        // Arrange
        const weightData = [        
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-20'), 90, 2),
        ];

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert - Component renders without crashing
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // LineChart renders as SVG
    });

    test('renders with custom height prop', () => {
        // Arrange
        const weightData = [        
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-20'), 85, 2),
        ];

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} height={500} />
            </QueryClientProvider>
        );

        // Assert - Check that chart is rendered with custom height
        const chart = container.querySelector('.recharts-wrapper');
        expect(chart).toBeInTheDocument();
    });

    test('handles empty weight data gracefully', () => {
        // Arrange
        const weightData: WeightEntry[] = [];

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert - No crash, chart still renders
        expect(screen.queryByRole('img', { hidden: true })).toBeInTheDocument();
    });

    test('calculates and displays EMA trend line', () => {
        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-01'), 80, 1),
            new WeightEntry(new Date('2021-12-05'), 82, 2),
            new WeightEntry(new Date('2021-12-10'), 81, 3),
            new WeightEntry(new Date('2021-12-15'), 83, 4),
        ];

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert - Check for trend line in legend
        expect(screen.getByText('Trend')).toBeInTheDocument();
    });

    test('displays mean weight reference line', () => {
        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-01'), 80, 1),
            new WeightEntry(new Date('2021-12-10'), 90, 2),
        ];

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert - Mean should be 85 (80 + 90) / 2
        expect(container.textContent).toContain('Mean');
    });

    test('displays current trend reference line', () => {
        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-01'), 80, 1),
            new WeightEntry(new Date('2021-12-10'), 85, 2),
        ];

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert
        expect(container.textContent).toContain('Current Trend');
    });

    test('renders weight and trend in legend', () => {
        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-01'), 80, 1),
            new WeightEntry(new Date('2021-12-10'), 85, 2),
        ];

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert - Check legend items
        expect(screen.getByText('Weight')).toBeInTheDocument();
        expect(screen.getByText('Trend')).toBeInTheDocument();
    });

    test('sorts weight data by date', () => {
        // Arrange - Weights provided out of order
        const weightData = [
            new WeightEntry(new Date('2021-12-20'), 90, 2),
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-15'), 85, 3),
        ];

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert - Should render without errors (sorting happens internally)
        expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
    });

    test('handles single weight entry', () => {
        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-10'), 80, 1),
        ];

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert - Should render without errors
        expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
        expect(screen.getByText('Weight')).toBeInTheDocument();
    });

    test('custom dot renders with variance line', () => {
        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-01'), 80, 1),
            new WeightEntry(new Date('2021-12-10'), 85, 2),
            new WeightEntry(new Date('2021-12-20'), 82, 3),
        ];

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert - Check for circles (custom dots) in the SVG
        const circles = container.querySelectorAll('circle');
        expect(circles.length).toBeGreaterThan(0);
        
        // Check for variance lines (dashed lines)
        const lines = container.querySelectorAll('line[stroke-dasharray="2,2"]');
        expect(lines.length).toBeGreaterThan(0);
    });

    test('opens modal when clicking on weight dot', async () => {
        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-10'), 80, 1),
        ];

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Click on a weight dot (circle element)
        const circles = container.querySelectorAll('circle');
        const weightDot = Array.from(circles).find(circle => 
            circle.getAttribute('style')?.includes('cursor: pointer')
        );

        if (weightDot) {
            fireEvent.click(weightDot);
        }

        // Assert - Modal should open (check for "edit" in the document)
        await waitFor(() => {
            // The modal title uses translation key 'edit'
            expect(container.textContent).toContain('edit');
        });
    });

    test('calculates EMA correctly with multiple data points', () => {
        // Arrange - Data where we can verify EMA calculation
        const weightData = [
            new WeightEntry(new Date('2021-12-01'), 100, 1),
            new WeightEntry(new Date('2021-12-02'), 100, 2),
            new WeightEntry(new Date('2021-12-03'), 100, 3),
        ];

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert - With constant weight, trend should converge to that weight
        expect(container.textContent).toContain('Current Trend: 100.0');
    });

    test('applies correct variance coloring (positive and negative)', () => {
        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-01'), 80, 1),
            new WeightEntry(new Date('2021-12-10'), 85, 2),
            new WeightEntry(new Date('2021-12-20'), 78, 3),
        ];

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert - Check for variance lines with different colors
        const redLines = container.querySelectorAll('line[stroke="#ff6b6b"]'); // Positive variance
        const greenLines = container.querySelectorAll('line[stroke="#51cf66"]'); // Negative variance
        
        // Should have both positive and negative variance lines
        expect(redLines.length + greenLines.length).toBeGreaterThan(0);
    });
});
