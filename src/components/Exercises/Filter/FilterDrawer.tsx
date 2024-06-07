import React, { useState } from 'react';
import { Button, Divider, Drawer, Stack, Typography } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

type FilterDrawerProps = {
    children: React.ReactNode;
}

export const FilterDrawer = ({ children }: FilterDrawerProps) => {
    const [t] = useTranslation();
    const [open, setOpen] = useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    return (
        <>
            <Button onClick={toggleDrawer(true)}>
                <FilterAltIcon />
            </Button>
            <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography gutterBottom variant="h6" m={2}>
                        {t('filters')}
                    </Typography>
                    <Button onClick={toggleDrawer(false)}>
                        <CloseIcon />
                    </Button>
                </Stack>
                <Divider />
                {children}
            </Drawer>
        </>
    );
};
