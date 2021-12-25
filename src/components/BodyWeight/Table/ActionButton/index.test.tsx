import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import { ActionButton } from './index';

describe("Body weight test", () => {

    test('renders without crashing', async () => {

        const weightsData = {id: 1, weight: 80, date: new Date('2021/12/10'), change: 2, days: 3};
        
        // since I used context api to provide state, also need it here
        render(<ActionButton weight={weightsData} />);

        //both edit and delete buttons are found in screen
        const editButton = await screen.findByText("edit");
        const deleteButton = await screen.findByText("delete");
        expect(editButton).toBeInTheDocument();
        expect(deleteButton).toBeInTheDocument();

        const ul = screen.getByRole('list', {hidden: true});
        expect(ul).toHaveStyle('display: none');
    });

    test('should have list of actions hidden', () => {
        const weightsData = {id: 1, weight: 80, date: new Date('2021/12/10'), change: 2, days: 3};
        
        // since I used context api to provide state, also need it here
        render(<ActionButton weight={weightsData} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);

        const ul = screen.getByRole('list', {hidden: true});
        expect(ul).not.toHaveStyle('display: none');

    });
    
});
