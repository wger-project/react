import React from 'react';
import styles from './notification.module.css';

export interface NotificationType {
    message: string
    success: boolean
}

export const Notification = ({message, success}: NotificationType) => {
    
    const inlineStyles = success ? {
        backgroundColor: "#e0ffe3",
        color: "#00780c"
    } : {
        backgroundColor: "#ffd9d9",
        color: "#9c0000"
    };
    
    return (
        <div style={inlineStyles} className={styles.notification}>
            {message}
        </div>
    );
};
