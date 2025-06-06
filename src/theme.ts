import { createTheme } from '@mui/material/styles';
import { ThemeOptions } from '@mui/material/styles/createTheme';

const fontFamilyBold = [
    '"Open Sans Bold"',
    'sans-serif'
].join(',');

const fontFamilyLight = [
    '"Open Sans Light"',
    'sans-serif'
].join(',');

const themeOptions: ThemeOptions = {

    spacing: 8,
    typography: {
        h3: {
            fontFamily: fontFamilyBold,
        },
        h4: {
            fontFamily: fontFamilyBold,
        },
        h5: {
            fontFamily: fontFamilyBold,
        },
        h6: {
            fontFamily: fontFamilyBold,
        },
        fontFamily: fontFamilyLight,
    },
    palette: {
        primary: {
            main: '#2A4C7D',
        },
        secondary: {
            main: '#e63946',
        },
        warning: {
            main: '#cba328',
        },
        info: {
            main: '#457b9d',
        },
        success: {
            main: '#307916',
        },
    }
};

export const theme = createTheme(themeOptions);
export const makeTheme = (element: HTMLDivElement) => createTheme(
    {
        ...themeOptions,
        components: {
            MuiPopover: {
                defaultProps: {
                    container: element,
                },
            },
            MuiPopper: {
                defaultProps: {
                    container: element,
                },
            },
            MuiModal: {
                defaultProps: {
                    container: element,
                },
            },
        },
    }
);
