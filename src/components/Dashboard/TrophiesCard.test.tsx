import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { TrophiesCard } from "components/Dashboard/TrophiesCard";
import { useUserTrophiesQuery } from "components/Trophies/queries/trophies";
import { testQueryClient } from "tests/queryClient";
import { testUserTrophies } from "tests/trophies/trophiesTestData";

jest.mock("components/Trophies/queries/trophies");

describe("test the TrophiesCard component", () => {

    describe("Trophies available", () => {
        beforeEach(() => {
            (useUserTrophiesQuery as jest.Mock).mockImplementation(() => ({
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
    });


    describe("No weight entries available", () => {

        beforeEach(() => {
            (useUserTrophiesQuery as jest.Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: null
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
