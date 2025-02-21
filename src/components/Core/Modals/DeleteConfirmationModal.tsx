import CloseIcon from '@mui/icons-material/Close';
import { Button, Card, CardActions, CardContent, CardHeader, Modal, Typography } from "@mui/material";
import { FunctionComponent } from 'react';
import { useTranslation } from "react-i18next";

export interface DeleteConfirmationModalProps {
    title: String,
    subtitle?: String,
    message?: String,
    isOpen: boolean,
    closeFn: any,
    deleteFn: any
}

export const DeleteConfirmationModal: FunctionComponent<DeleteConfirmationModalProps> = (
    {
        title,
        subtitle,
        isOpen,
        message,
        deleteFn,
        closeFn
    }) => {

    const [t] = useTranslation();

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        // width: 500,
        bgcolor: 'background.paper',
        borderWidth: 0,
        boxShadow: 24,
        p: 2,
    };

    const handleDelete = () => {
        deleteFn();
        closeFn();
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
                    titleTypographyProps={{ variant: 'h6' }}
                    subheader={subtitle}
                    action={<CloseIcon onClick={closeFn} />}
                />
                <CardContent>
                    <Typography variant="body1">
                        {message}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button color="error" variant="contained" onClick={handleDelete}>
                        {t('delete')}
                    </Button>
                    <Button color="primary" onClick={closeFn}>
                        {t('close')}
                    </Button>
                </CardActions>
            </Card>
        </Modal>
    );
};
