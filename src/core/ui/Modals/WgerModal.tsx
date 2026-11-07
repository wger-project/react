import CloseIcon from '@mui/icons-material/Close';
import { Card, CardContent, CardHeader, Modal } from "@mui/material";
import React, { FunctionComponent } from 'react';

export interface WgerModalProps {
    title: string,
    subtitle?: string,
    isOpen: boolean,
    closeFn: () => void,
    /**
     * Keeps the card at one height instead of following its content. For a
     * form whose fields depend on what the user picks: growing and shrinking
     * moves the whole dialog, since it is centered on the screen.
     */
    stableHeight?: boolean,
    children: React.ReactNode
}

export const WgerModal: FunctionComponent<WgerModalProps> = ({
                                                                 title,
                                                                 subtitle,
                                                                 isOpen,
                                                                 closeFn,
                                                                 stableHeight,
                                                                 children
                                                             }) => {

    // The card is positioned out of the flow, so without a bound it grows past
    // the viewport in both directions and takes its own header with it. The
    // margin it keeps is smaller on a phone, where 64px is a good part of the
    // screen. Bounded here rather than in each modal: a long list is the
    // normal case (the metric picker, the category order, a form).
    const margin = { xs: '32px', sm: '64px' };
    // Dynamic viewport units: with vh the browser's collapsing toolbar counts
    // towards the height, so the card can reach past what is visible
    const available = {
        xs: `calc(100dvh - ${margin.xs})`,
        sm: `calc(100dvh - ${margin.sm})`,
    };

    // No padding on the card itself, the header and the content have their own
    const style = {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        // A phone is narrower than the 400px a dialog reads well at, and a
        // centered card wider than the screen is cut off on both sides
        width: { xs: 'calc(100vw - 32px)', sm: 'auto' },
        minWidth: { xs: 0, sm: '400px' },
        maxHeight: available,
        display: 'flex',
        flexDirection: 'column',
        ...(stableHeight
            ? {
                height: {
                    xs: `min(600px, ${available.xs})`,
                    sm: `min(600px, ${available.sm})`,
                },
            }
            : {}),
    };

    return (
        <Modal
            open={isOpen}
            onClose={closeFn}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Card sx={style}>
                <CardHeader
                    title={title}
                    subheader={subtitle}
                    action={<CloseIcon onClick={closeFn} />}
                />
                {/* Only the content scrolls, so the title and the close
                  * button stay reachable */}
                <CardContent sx={{ overflowY: 'auto', minHeight: 0 }}>
                    {children}
                </CardContent>
            </Card>
        </Modal>

    );
};
