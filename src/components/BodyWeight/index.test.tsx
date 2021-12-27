import React from 'react';
import {render, screen} from '@testing-library/react';
import {getWeights} from "services";
import {BodyWeight} from "./index";
import {StateProvider} from 'state';

jest.mock("services");
console.log = jest.fn();

describe("Test BodyWeight component", () => {
    test('renders without crashing', async () => {

        // Arrange
        const weightData = [
            {id: 1, user: 3, weight: '80', date: '2021-12-10'},
            {id: 2, user: 2, weight: '90', date: '2021-12-20'},
        ];

        // @ts-ignore
        getWeights.mockImplementation(() => Promise.resolve(weightData));

        // Act
        render(<StateProvider><BodyWeight/></StateProvider>);

        // Assert
        expect(getWeights).toHaveBeenCalledTimes(1);

        // Both weights are found in th document
        const textElement = await screen.findByText("80");
        expect(textElement).toBeInTheDocument();

        const textElement2 = await screen.findByText("90");
        expect(textElement2).toBeInTheDocument();
    });

    test('errors get handled', () => {

        // Arrange
        // @ts-ignore
        getWeights.mockImplementation(() => {
            throw new Error('User not found');
        });

        // Act
        render(<StateProvider><BodyWeight/></StateProvider>);

        // Assert
        expect(getWeights).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledTimes(1);

        // No weights are found in th document
        const linkElement = screen.queryByText("80");
        expect(linkElement).toBeNull();

        const linkElement2 = screen.queryByText("90");
        expect(linkElement2).toBeNull();
    });
});
