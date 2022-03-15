import React from 'react';
import { setNotification, useWeightStateValue } from 'state';
import { Alert, AlertTitle, Button } from '@mui/material';
import styles from './notifications.module.css';

export const Notifications = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, dispatch] = useWeightStateValue();

    const closeNotification = () => {
        dispatch(setNotification({ notify: false, message: "", severity: undefined, title: "", type: undefined }));
    };

    const undoDelete = () => {
        dispatch(setNotification({
            notify: false,
            message: "",
            severity: undefined,
            title: "",
            type: undefined,
            undo: true
        }));
    };

    if (!state.notification.notify) {
        return null;
    }

    if (state.notification.type === "delete") {
        return (
            <Alert
                className={styles.notification}
                severity={state.notification.severity}
                action={
                    <Button color="inherit" size="small" onClick={undoDelete}>
                        UNDO
                    </Button>
                }
                variant='filled'
            >
                <AlertTitle>{state.notification.title}</AlertTitle>
                <strong>{state.notification.message}</strong>
            </Alert>
        );
    }

    return (
        <Alert
            className={styles.notification}
            severity={state.notification.severity}
            onClose={() => closeNotification()}
            variant='filled'
        >
            <AlertTitle>{state.notification.title}</AlertTitle>
            <strong>{state.notification.message}</strong>
        </Alert>
    );
};
