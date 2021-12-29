import React from 'react';
import './App.css';
import {
    BodyWeight,
    Header
} from './components';
import {useTranslation} from "react-i18next";


function App() {

    return (
        <div className="App">
            <Header />
            <BodyWeight/>
        </div>
    );
}

export default App;
