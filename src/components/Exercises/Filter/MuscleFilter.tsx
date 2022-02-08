import React from 'react';
import { Skeleton } from "@mui/material";
import { t } from "i18next";

export const MuscleFilter = () => {

    return (
        <div>
            {t('muscles')}
            <Skeleton animation={false} height={300} />
        </div>
    );
};