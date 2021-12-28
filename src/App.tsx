import React from 'react';
import './App.css';
import {
    BodyWeight,
    Header
} from './components';
import {useTranslation} from "react-i18next";


function App() {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {t} = useTranslation();

    return (
        <div className="App">
            <Header />
            <BodyWeight/>
        </div>
    );
}

export default App;
