import React, { FunctionComponent } from 'react';
import { Button, Card, CardActions, CardContent, CardHeader, Modal } from "@mui/material";

interface WgerModalProps {
    title: String,
    openFn: boolean,
    closeFn: any,

}

//(props)
export const WgerModal: FunctionComponent<WgerModalProps> = ({ title, openFn, closeFn, children }) => {

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
            open={openFn}
            onClose={closeFn}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Card sx={style}>
                <CardHeader title={title} subheader="September 14, 2016" />
                <CardContent>
                    {children}
                </CardContent>
                <CardActions>

                    <Button onClick={closeFn}>Close</Button>
                </CardActions>
            </Card>
        </Modal>

    );
};
