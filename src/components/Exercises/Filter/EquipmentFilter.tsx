import React from 'react';
import { Skeleton } from "@mui/material";
import { t } from "i18next";

export const EquipmentFilter = () => {

    return (
        <div>
            {t('equipment')}
            <Skeleton animation={false} height={300} />
        </div>
    );
};