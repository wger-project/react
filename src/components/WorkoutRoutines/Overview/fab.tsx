import React from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { makeLink, WgerLink } from "utils/url";

export const AddWorkoutFab = () => {

    // TODO: replace with a popup when the logic is available in react
    const handleClick = () => window.location.href = makeLink(WgerLink.ROUTINE_ADD);

    return (
        <div>
            <Fab
                color="secondary"
                aria-label="add"
                onClick={handleClick}
                sx={{
                    position: 'fixed',
                    bottom: '5rem',
                    right: (theme) => theme.spacing(2),
                    zIndex: 9,
                }}>
                <AddIcon />
            </Fab>
        </div>
    );
};