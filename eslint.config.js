// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
// import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            'react': reactPlugin,
            'react-hooks': reactHooksPlugin,
            'import': importPlugin,
            //'jsx-a11y': jsxA11yPlugin
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
        settings: {
            react: {
                version: 'detect'
            }
        }
    },

    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            'semi': ['error', 'always'],
            'camelcase': ['warn'],
            // '@typescript-eslint/ban-ts-comment': [
            //     'error',
            //     {
            //         'ts-ignore': 'allow-with-description',
            //         'ts-expect-error': 'allow-with-description',
            //         'minimumDescriptionLength': 10
            //     }
            // ],
        }
    },
    {
        ignores: ['build/**/*']
    }
);