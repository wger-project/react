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
                                                          resetDelay = 2000,
                                                          ...buttonProps
                                                      }) => {
    const { t } = useTranslation();
    const [internalStatus, setInternalStatus] = useState<SaveStatus>('idle');

    const currentStatus = externalStatus || internalStatus;


    const getButtonConfig = (status: SaveStatus) => {
        switch (status) {
            case 'loading':
                return {
                    text: loadingText || t('saving', 'Saving...'),
                    color: 'primary' as const,
                    disabled: true
                };
            case 'success':
                return {
                    text: successText || `${t('save', 'Save')} ✅`,
                    color: 'success' as const,
                    disabled: true
                };
            case 'error':
                return {
                    text: errorText || `${t('save', 'Save')} ❌`,
                    color: 'error' as const,
                    disabled: false
                };
            default:
                return {
                    text: defaultText || t('save', 'Save'),
                    color: 'primary' as const,
                    disabled: false
                };
        }
    };

    const buttonConfig = getButtonConfig(currentStatus);

    const handleClick = async () => {
        if (currentStatus === 'loading') return;

        try {
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
            color={buttonConfig.color}
            disabled={buttonConfig.disabled}
            onClick={handleClick}
        >
            {buttonConfig.text}
        </Button>
    );
};