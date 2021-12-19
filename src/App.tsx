import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Trans, useTranslation} from "react-i18next";


function App() {

  const {t} = useTranslation();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <p>
          <Trans i18nKey="test"/> {t('test')}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
