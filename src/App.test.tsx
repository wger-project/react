import React from 'react';
import {render} from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {

    render(<App/>);

    //const linkElement = screen.getByText("test");
    //expect(linkElement).toBeInTheDocument();
});
