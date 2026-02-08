import { Typography } from '@mui/material';


import { MarkdownToJSX } from 'markdown-to-jsx';
import React from 'react';


const StripElement = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;

const StripBlock = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="body1" component="div" sx={{ mb: 1.5 }}>
        {children}
    </Typography>
);

/*
 * Custom options for markdown-to-jsx to ensure that only allowed HTML tags are rendered
 * (note that there's still server side filtering for this)
 */
export const MarkdownOptions: MarkdownToJSX.Options = {
    overrides: {
        p: {
            component: Typography,
            props: { variant: 'body1', sx: { mb: 1.5 } }
        },

        // Allowed inline/list tags
        strong: { component: 'strong' },
        b: { component: 'b' },
        em: { component: 'em' },
        i: { component: 'i' },
        ul: { component: 'ul', props: { style: { paddingLeft: '20px', margin: '0 0 16px 0' } } },
        ol: { component: 'ol', props: { style: { paddingLeft: '20px', margin: '0 0 16px 0' } } },
        li: { component: 'li' },

        // Block links and headings by mapping them to plan spans.
        a: { component: StripElement },

        // --- BLOCKED TAGS (No headings allowed) ---
        h1: { component: StripBlock },
        h2: { component: StripBlock },
        h3: { component: StripBlock },
        h4: { component: StripBlock },
        h5: { component: StripBlock },
        h6: { component: StripBlock },        // Tables, images, etc. are naturally ignored by markdown-to-jsx if not explicitly defined

        img: { component: () => null },

        table: { component: 'div' },
    },
};