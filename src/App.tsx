import React from 'react';
import './App.css';
import {BodyWeight} from './components';
import {useTranslation} from "react-i18next";


function App() {

    const {t} = useTranslation();

    return (
        <div className="App">
            <header className="App-header">
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
            <BodyWeight/>
        </div>
    );
}

export default App;
