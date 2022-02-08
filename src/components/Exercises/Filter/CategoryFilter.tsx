import React from 'react';
import { Skeleton } from "@mui/material";
import { t } from "i18next";

export const CategoryFilter = () => {

    return (
        <div>
            {t('category')}
            <Skeleton animation={false} height={300} />
        </div>
    );
};