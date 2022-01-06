import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ActionButton } from './index';
import { ProcessedWeight } from '..';

describe("Body weight test", () => {

    const handleDeleteWeight = (weight: ProcessedWeight) => {
        console.log(weight);
        
    };

    test('renders without crashing', async () => {

        // Arrange
        //
        const weightsData = { id: 1, weight: 80, date: new Date('2021/12/10'), change: 2, days: 3 };
        render(<ActionButton handleDeleteWeight={handleDeleteWeight} weight={weightsData}/>);

        // Act
        //
        // Note that MUI renders the menu in a different point in the DOM so they are
        // not present before clicking the button
        const button = screen.getByRole("button");
        const editButton = screen.queryByText("edit");
        const deleteButton = screen.queryByText("delete");
        const menuElement = screen.queryByRole('menu');

        // Assert
        //
        expect(button).toBeInTheDocument();
        expect(deleteButton).toBeNull();
        expect(editButton).toBeNull();
        expect(menuElement).toBeNull();
    });

    test('should have list of actions hidden', async () => {
        // Arrange
        //
        const weightsData = { id: 1, weight: 80, date: new Date('2021/12/10'), change: 2, days: 3 };

        // Act
        //
        render(<ActionButton handleDeleteWeight={handleDeleteWeight} weight={weightsData}/>);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        fireEvent.click(button);

        // Assert
        //
        const editButton = await screen.findByText("edit");
        const deleteButton = await screen.findByText("delete");
        const menuElement = screen.getByRole('menu');
        expect(deleteButton).toBeTruthy();
        expect(editButton).toBeTruthy();
        expect(menuElement).toBeInTheDocument();

    });

});
