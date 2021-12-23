import React from 'react';
import {render, screen} from '@testing-library/react';
import {getWeights} from "services";
import {BodyWeight} from "./index";
import {StateProvider} from 'state';

jest.mock("services");

describe("Body weight test", () => {
    test('renders without crashing', async () => {

        const weightData = [
            {id: 1, user: 3, weight: '80', date: '2021-12-10'},
            {id: 2, user: 2, weight: '90', date: '2021-12-20'},
        ];
        // @ts-ignore
        getWeights.mockImplementation(() => Promise.resolve(weightData));
    
        // since I used context api to provide state, also need it here
        render(<StateProvider><BodyWeight /></StateProvider>);
        
        // Both weights are found in th document
        const linkElement = await screen.findByText("80");
        expect(linkElement).toBeInTheDocument();
    
        const linkElement2 = await screen.findByText("90");
        expect(linkElement2).toBeInTheDocument();
    });
});
