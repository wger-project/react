import React, {useState} from 'react'
import {Theme} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {ProcessedWeight} from '..';
import styles from './action_button.module.css'
import {Trans} from "react-i18next";

interface ActionButtonProps {
    weight: ProcessedWeight
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        actions__list: {
            backgroundColor: "#000",
            zIndex: 9999
        },
    }
});

export const ActionButton = ({weight}: ActionButtonProps) => {
    const [showActions, setshowActions] = useState<boolean>(false);
    const classes = useStyles();


    const handleShowActions = () => {
        setshowActions(!showActions)

    }

    const actionListDisplay = showActions ? "block" : "none";

    return (
        <button className={styles.button} onClick={handleShowActions} onBlur={handleShowActions}>
            &#9660;
            <ul style={{display: actionListDisplay}} className={`${styles.actions__list} ${classes.actions__list}`}>
                <li><a className={styles.actions__link} href="/"><Trans i18nKey={"edit"}/></a></li>
                <li><a className={styles.actions__link} href="/"><Trans i18nKey={"delete"}/></a></li>
            </ul>
        </button>
    )
}
