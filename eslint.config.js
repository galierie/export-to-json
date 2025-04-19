import globals from 'globals';
import js from '@eslint/js';
import json from '@eslint/json';
import prettierConfig from 'eslint-config-prettier';

export default [
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },

    {
        files: ['**/*.js'],
        ...js.configs.recommended,
    },

    {
        files: ['**/*.json'],
        ignores: ['package.json'],
        language: 'json/json',
        ...json.configs.recommended,
    },

    {
        ignores: ['node_modules/**/*'],
    },

    prettierConfig,
];
