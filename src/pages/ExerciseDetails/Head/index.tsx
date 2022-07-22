import React, { useState } from 'react';
import { Button, Chip, Divider, Menu, MenuItem, Stack } from '@mui/material';
import { ExerciseBase } from 'components/Exercises/models/exerciseBase';
import { ExerciseTranslation } from 'components/Exercises/models/exerciseTranslation';
import { Language } from 'components/Exercises/models/language';
import { Link } from 'react-router-dom';
import styles from './head.module.css';
import { getTranslationKey } from "utils/strings";
import { useTranslation } from "react-i18next";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RedoIcon from '@mui/icons-material/Redo';

export interface HeadProp {
    exercise: ExerciseBase
    languages: Language[]
    changeLanguage: (lang: Language) => void,
    language: Language | undefined // language displayed in the head since it's not found in the translations
    currentTranslation: ExerciseTranslation | undefined
}

export const Head = ({ exercise, languages, changeLanguage, language, currentTranslation }: HeadProp) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openLanguageMenu = Boolean(anchorEl);
    const [t] = useTranslation();

    // console.log(exercise);
    // console.log(currentTranslation);

    const handleLanguageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageClick = (lang: Language) => {
        changeLanguage(lang);
        handleClose();
    };

    const category = exercise.category.name;
    const equipment = <Stack direction="row" spacing={1}>
        {exercise.equipment.map(e => {
            return <Chip key={e.id} label={t(getTranslationKey(e.name))} />;
        })}
        <Chip label={t(getTranslationKey(category))} />
    </Stack>;
    const languagesList = languages.map(l => {
        return <MenuItem className={styles.languageMenuItem} key={l.nameShort}
                         onClick={() => handleLanguageClick(l)}>{l.nameLong}</MenuItem>;
    });


    return (
        <div className={styles.root}>
            <div className={styles.detail_language}>

                <div className={styles.detail}>
                    <Link to='/exercises'>Exercise</Link>  &gt; {currentTranslation?.name}
                </div>
                <div className={styles.languages}>
                    <div className={styles.language}>
                        <Button
                            size="small"
                            id="basic-button"
                            onClick={handleLanguageButtonClick}
                            startIcon={<MoreVertIcon />}
                        >
                            {language?.nameLong}
                        </Button>

                        <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={openLanguageMenu}
                            onClose={handleClose}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button',
                            }}
                            sx={{ padding: 20 }}
                        >
                            <MenuItem disabled={true}>Change this exercise's language</MenuItem>
                            <Divider />
                            {languagesList}
                        </Menu>
                    </div>
                </div>
            </div>
            <div className={styles.header}>
                <div className={styles.heading}>
                    <h1>{currentTranslation?.name}</h1>
                    {equipment}
                </div>
                <nav className={styles.toolbar}>
                    <Link to='#' className={styles.nav_link}>VIEW</Link>
                    <Link to='#' className={styles.nav_link}>EDIT</Link>
                    <div className={styles.vertical_line} />
                    <RedoIcon />
                    <MoreVertIcon />
                </nav>
            </div>
        </div>
    );
};
