import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './i18n';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import reportWebVitals from './reportWebVitals';
import {theme} from './theme';
import {ThemeProvider} from '@mui/material/styles';
import { StateProvider } from 'state';

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading... </div>}>
      <Router>
        <StateProvider>
          <ThemeProvider theme={theme}>
            <App/>
          </ThemeProvider>
        </StateProvider>
      </Router>
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
