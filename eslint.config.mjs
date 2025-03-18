import eslintJS from '@eslint/js';
import eslintJSON from '@eslint/json';
import eslintPrettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(
    {
        files: ['**/*.js', '**/*.mjs'],
        ...eslintJS.configs.recommended,
    },
    {
        files: ['**/*.json'],
        ignores: ['package.json'],
        language: 'json/json',
        ...eslintJSON.configs.recommended,
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        ignores: ['node_modules/**/*'],
    },
    eslintPrettierConfig,
);
