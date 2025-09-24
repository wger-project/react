import { Button, ButtonProps } from "@mui/material";
import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";

export type SaveStatus = 'idle' | 'loading' | 'success' | 'error';

interface SaveButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled'> {
    onSave: () => Promise<void> | void;
    saveStatus?: SaveStatus;
    loadingText?: string;
    successText?: string;
    errorText?: string;
    defaultText?: string;
    resetDelay?: number;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
                                                          onSave,
                                                          saveStatus: externalStatus,
                                                          loadingText,
                                                          successText,
                                                          errorText,
                                                          defaultText,
                                                          resetDelay = 1500,
                                                          ...buttonProps
                                                      }) => {
    const { t } = useTranslation();
    const [internalStatus, setInternalStatus] = useState<SaveStatus>('idle');
    const [isCoolingDown, setIsCoolingDown] = useState<boolean>(false);

    const currentStatus = externalStatus || internalStatus;


    const getButtonConfig = (status: SaveStatus) => {
        switch (status) {
            case 'loading':
                return {
                    text: loadingText || t('saving', 'Saving...'),
                    disabled: true
                };
            case 'success':
                return {
                    text: successText || `${t('save', 'Save')} ✅`,
                    disabled: true
                };
            case 'error':
                return {
                    text: errorText || `${t('save', 'Save')} ❌`,
                    disabled: false
                };
            default:
                return {
                    text: defaultText || t('save', 'Save'),
                    disabled: false
                };
        }
    };

    const buttonConfig = getButtonConfig(currentStatus);

    const handleClick = async () => {
        if (currentStatus === 'loading') return;

        try {
            // Start cooldown immediately on click
            setIsCoolingDown(true);
            const cooldownTimer = setTimeout(() => setIsCoolingDown(false), resetDelay);

            if (!externalStatus) {
                setInternalStatus('loading');
            }

            await onSave();

            if (!externalStatus) {
                setInternalStatus('success');
            }
        } catch (error) {
            if (!externalStatus) {
                setInternalStatus('error');
            }
        } finally {
            // Ensure cooldown timer exists for at least resetDelay; already set above
        }
    };

    // reset status
    useEffect(() => {
        if ((currentStatus === 'success' || currentStatus === 'error') && !externalStatus) {
            const timer = setTimeout(() => {
                setInternalStatus('idle');
            }, resetDelay);

            return () => clearTimeout(timer);
        }
    }, [currentStatus, resetDelay, externalStatus]);

    return (
        <Button
            {...buttonProps}
            disabled={buttonConfig.disabled || isCoolingDown}
            onClick={handleClick}
        >
            {buttonConfig.text}
        </Button>
    );
};