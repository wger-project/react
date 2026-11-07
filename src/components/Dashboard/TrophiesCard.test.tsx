import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { TrophiesCard } from "@/components/Dashboard/TrophiesCard";
import { Trophy, UserTrophy, useUserTrophiesQuery } from "@/components/Trophies";
import { testQueryClient } from "@/tests/queryClient";
import { testTrophies, testUserTrophies } from "@/tests/trophies/trophiesTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Trophies/queries/trophies");

describe("test the TrophiesCard component", () => {

    describe("Trophies available", () => {
        beforeEach(() => {
            (useUserTrophiesQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: testUserTrophies()
            }));
        });

        test('renders the trophies correctly', async () => {
            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <TrophiesCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useUserTrophiesQuery).toHaveBeenCalled();
            expect(screen.getByText('Beginner')).toBeInTheDocument();
            expect(screen.getByText('Unstoppable')).toBeInTheDocument();
        });

        test('keeps personal record trophies out of the widget', async () => {

            // Arrange
            // PR trophies have their own treatment and must not show up here
            const prTrophy = new UserTrophy({
                id: 999,
                isNotified: true,
                trophy: new Trophy({
                    id: 999,
                    type: 'pr',
                    isHidden: false,
                    uuid: 'trophy-999',
                    name: 'New bench press record',
                    description: 'A new personal record',
                    image: 'https://example.com/images/pr.png',
                    isProgressive: false,
                }),
                earnedAt: new Date('2025-12-19T10:00:00Z'),
                progress: 100,
            });
            (useUserTrophiesQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: [...testUserTrophies(), prTrophy]
            }));

            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <TrophiesCard />
                </QueryClientProvider>
            );

            // Assert
            expect(screen.getByText('Beginner')).toBeInTheDocument();
            expect(screen.queryByText('New bench press record')).not.toBeInTheDocument();
        });

        test('renders duplicated trophies without colliding keys', async () => {

            // Arrange
            // The server can award the same non-repeatable trophy twice
            const trophies = testUserTrophies();
            (useUserTrophiesQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: [trophies[0], new UserTrophy({ ...trophies[0], id: 124 })]
            }));
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
            });

            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <TrophiesCard />
                </QueryClientProvider>
            );

            // Assert
            expect(screen.getAllByText('Beginner')).toHaveLength(2);
            expect(consoleError).not.toHaveBeenCalled();
            consoleError.mockRestore();
        });

        test('shows the empty card when the user only has PR trophies', async () => {

            // Arrange
            const prTrophy = new UserTrophy({
                id: 999,
                isNotified: true,
                trophy: new Trophy({
                    id: 999,
                    type: 'pr',
                    isHidden: false,
                    uuid: 'trophy-999',
                    name: 'New bench press record',
                    description: 'A new personal record',
                    image: 'https://example.com/images/pr.png',
                    isProgressive: false,
                }),
                earnedAt: new Date('2025-12-19T10:00:00Z'),
                progress: 100,
            });
            (useUserTrophiesQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: [prTrophy]
            }));

            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <TrophiesCard />
                </QueryClientProvider>
            );

            // Assert
            expect(screen.getByText('nothingHereYet')).toBeInTheDocument();
        });
    });


    describe("Same trophy awarded twice", () => {
        beforeEach(() => {
            // Two user-trophy rows for one trophy, as a repeatable award creates
            const trophy = testTrophies()[0];
            (useUserTrophiesQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: [
                    new UserTrophy({
                        id: 1,
                        trophy: trophy,
                        earnedAt: new Date('2025-12-19T10:00:00Z'),
                        progress: 100,
                        isNotified: true,
                    }),
                    new UserTrophy({
                        id: 2,
                        trophy: trophy,
                        earnedAt: new Date('2025-12-20T10:00:00Z'),
                        progress: 100,
                        isNotified: true,
                    }),
                ]
            }));
        });

        test('renders both awards, with unique keys', async () => {
            // Arrange
            const errorSpy = vi.spyOn(console, 'error');

            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <TrophiesCard />
                </QueryClientProvider>
            );

            // Assert
            expect(screen.getAllByText('Beginner')).toHaveLength(2);
            const duplicateKeyErrors = errorSpy.mock.calls.filter(
                (args) => String(args[0]).includes('same key')
            );
            expect(duplicateKeyErrors).toHaveLength(0);
            errorSpy.mockRestore();
        });
    });


    describe("No trophies available", () => {

        beforeEach(() => {
            (useUserTrophiesQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: []
            }));
        });

        test('correctly shows custom empty card, without call to action button', async () => {

            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <TrophiesCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useUserTrophiesQuery).toHaveBeenCalled();
            expect(screen.getByText('nothingHereYet')).toBeInTheDocument();
            expect(screen.queryByText('nothingHereYetAction')).not.toBeInTheDocument();
            expect(screen.queryByText('add')).not.toBeInTheDocument();
        });
    });
});
