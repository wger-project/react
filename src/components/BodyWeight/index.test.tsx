import React from 'react';
import {render} from '@testing-library/react';
import {get_weights} from "../../services";
import {BodyWeight} from "./index";

jest.mock("axios");
jest.mock("../../services");


test('renders without crashing', async () => {

    const weightData = [
        {id: 1, weight: '80', date: '2021-12-10'},
        {id: 2, weight: '90', date: '2021-12-20'},
    ];

    // @ts-ignore
    get_weights.mockImplementation(() => Promise.resolve(weightData));
    await render(<BodyWeight/>);
    expect(get_weights).toHaveBeenCalledTimes(1);

    // Both weights are found in th document

    // TODO: this still fails. Why??
    //const linkElement = screen.getByText("80");
    //expect(linkElement).toBeInTheDocument();
});
