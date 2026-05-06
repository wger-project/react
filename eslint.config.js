// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
// import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

// Domains with a public surface (`index.ts`). Other code must import via the
// domain root, never via internal sub-paths.
const DOMAINS = [
    'Exercises',
    'Routines',
    'Weight',
    'Nutrition',
    'Measurements',
    'Trophies',
    'User',
];

const restrictAllDomains = {
    "patterns": [{
        "group": DOMAINS.map(d => `@/components/${d}/*`),
        "message": "Import via the domain root (e.g. '@/components/Exercises'), not internal sub-paths.",
    }]
};

// Per-domain override: files inside `components/<Domain>/` may import their
// OWN internals via absolute paths (though relative paths are preferred).
// Cross-domain absolute internals remain forbidden.
const domainOverrides = DOMAINS.map(domain => ({
    files: [`src/components/${domain}/**/*.{ts,tsx}`],
    rules: {
        "no-restricted-imports": ["error", {
            "patterns": [{
                "group": DOMAINS
                    .filter(d => d !== domain)
                    .map(d => `@/components/${d}/*`),
                "message": `Import other domains via their public surface (e.g. '@/components/${DOMAINS[0]}'), not internal sub-paths.`,
            }]
        }],
    }
}));

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
            "@typescript-eslint/no-unused-vars": ["warn"],
            "@typescript-eslint/no-explicit-any": ["error"],
            "@typescript-eslint/no-non-null-asserted-optional-chain": ["warn"],
            "@typescript-eslint/no-unsafe-function-type": ["warn"],
            "@typescript-eslint/ban-ts-comment": [
                "warn", // changed to warning
                {
                    "ts-ignore": "allow-with-description",
                    "ts-expect-error": "allow-with-description",
                    "minimumDescriptionLength": 10
                }
            ],
            // Auto-fixable: consolidates multiple imports from the same module.
            "import/no-duplicates": ["error"],
            // Domain boundary: consumers must import via the public surface
            // (index.ts), not internal sub-paths.
            "no-restricted-imports": ["error", restrictAllDomains],
        }
    },
    // Per-domain overrides: relax the rule for same-domain imports.
    ...domainOverrides,
    {
        // The infrastructure layer (services/, state/, core/lib, tests/,
        // types.ts) sits BELOW the domains in the dependency graph. Importing
        // from a domain barrel here creates circular dependencies (the barrel
        // pulls in queries which depend on services). These files must use
        // direct sub-paths.
        files: [
            'src/services/**',
            'src/state/**',
            'src/core/lib/**',
            'src/tests/**',
            'src/types.ts',
        ],
        rules: {
            "no-restricted-imports": "off",
        }
    },
    {
        ignores: ['build/**/*']
    }
);
