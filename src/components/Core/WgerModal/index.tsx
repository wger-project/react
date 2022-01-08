import React, { FunctionComponent } from 'react';
import { Button, Card, CardActions, CardContent, CardHeader, Modal } from "@mui/material";
import { Trans } from "react-i18next";

export interface WgerModalProps {
    title: String,
    subtitle?: String,
    isOpen: boolean,
    closeFn: any,
}

export const WgerModal: FunctionComponent<WgerModalProps> = ({ title, subtitle, isOpen, closeFn, children }) => {

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        p: 2,
        minWidth: '400px'
    };

    return (
        <Modal
            open={isOpen}
            onClose={closeFn}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Card sx={style}>
                <CardHeader title={title} subheader={subtitle} />
                <CardContent>
                    {children}
                </CardContent>
                <CardActions>
                    <Button onClick={closeFn}>
                        <Trans i18nKey={'close'} />
                    </Button>
                </CardActions>
            </Card>
        </Modal>

    );
};
