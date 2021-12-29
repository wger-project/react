import React, {useState} from 'react';
import {ProcessedWeight} from '..';
import styles from './action_button.module.css';
import {Trans} from "react-i18next";

interface ActionButtonProps {
    weight: ProcessedWeight
}

export const ActionButton = ({weight}: ActionButtonProps) => {
    const [showActions, setshowActions] = useState<boolean>(false);

    const handleShowActions = () => {
        setshowActions(!showActions);
    };

    const actionListDisplay = showActions ? "block" : "none";

    return (
        <button className={styles.button} onClick={handleShowActions} onBlur={() => setshowActions(false)}>
            &#9660;
            <ul id='ul' style={{display: actionListDisplay}} className={`${styles.actions__list} `}>
                <li><a className={styles.actions__link} href="/"><Trans i18nKey={"edit"}/></a></li>
                <li><a className={styles.actions__link} href="/"><Trans i18nKey={"delete"}/></a></li>
            </ul>
        </button>
    );
};
