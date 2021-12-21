import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {get_weights} from "services";
import {BodyWeight} from "./index";
import { StateProvider } from 'state'

jest.mock("axios");
jest.mock("services");


test('renders without crashing', async () => {

    const weightData = [
        {id: 1, user:3, weight: '80', date: '2021-12-10'},
        {id: 2, user:2, weight: '90', date: '2021-12-20'},
    ];

    // @ts-ignore
    get_weights.mockImplementation(() => Promise.resolve(weightData));
    // since I used context api to provide state, also need it here
    render(<StateProvider><BodyWeight/></StateProvider>);
    expect(get_weights).toHaveBeenCalledTimes(1);

    // Both weights are found in th document
    // TODO: this still fails. Why?? Using waitFor for components that
    // update state asynchronously
    await waitFor(() => {
        const linkElement = screen.getByText("80");
        expect(linkElement).toBeInTheDocument();
    })
});
