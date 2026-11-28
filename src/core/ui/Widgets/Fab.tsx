import { Fab } from "@mui/material";
import React from "react";

/**
 * The floating action button of an overview: same look and same place on every
 * screen, only the icon behind it differs.
 *
 * It sits above the bottom navigation, and at the edge of the content rather
 * than of the window: on a wide screen the content is centred, and a button
 * pinned to the viewport would stand far away from what it adds to.
 */
export const WgerFab = (props: {
    onClick: () => void,
    /** Whether the screen is busy, e.g. reloading what the button just added to */
    disabled?: boolean,
    children: React.ReactNode,
}) =>
    <Fab
        color="secondary"
        aria-label="add"
        disabled={props.disabled}
        onClick={props.onClick}
        sx={{
            position: 'fixed',
            bottom: '5rem',
            right: (theme) => `max(${theme.spacing(2)}, calc((100vw - ${theme.breakpoints.values.lg}px) / 2 + ${theme.spacing(2)}))`,
            zIndex: 9,
        }}>
        {props.children}
    </Fab>;
