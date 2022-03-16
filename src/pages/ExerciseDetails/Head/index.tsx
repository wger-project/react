import React, { useState } from 'react';
import { Chip, Menu, MenuItem, Stack } from '@mui/material';
import { ExerciseBase } from 'components/Exercises/models/exerciseBase';
import { ExerciseTranslation } from 'components/Exercises/models/exerciseTranslation';
import { Language } from 'components/Exercises/models/language';
import { Link } from 'react-router-dom';
import styles from './head.module.css';

export interface HeadProp {
    exercise: ExerciseBase
    languages: Language[]
    changeLanguage: (lang: Language) => void,
    language: Language | undefined // language displayed in the head since it's not found in the translations
    currentTranslation: ExerciseTranslation | undefined
}

export const Head = ({exercise, languages, changeLanguage, language, currentTranslation}: HeadProp) => {
    const [anchorEl, setAnchorEl] = useState<null | SVGSVGElement>(null);
    const openLanguageMenu = Boolean(anchorEl);

    const handleLanguageButtonClick = (event: React.MouseEvent<SVGSVGElement>) => {
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
    const equipment = exercise.equipment.length !== 0 ? <Stack direction="row" spacing={1}>
                                                            {exercise.equipment.map(e => {
                                                                return <Chip key={e.id} label={e.name} />;
                                                            })}
                                                        </Stack> : "No equipment";
    const languagesList = languages.map(l => {
        return <MenuItem className={styles.languageMenuItem} key={l.nameShort} onClick={() => handleLanguageClick(l)}>{l.nameLong}</MenuItem>;
    });
    

  return (
    <div className={styles.root}>
        <div className={styles.detail_language}>
            <div className={styles.detail}>
                <Link to='/exercises'>Exercise</Link>  &gt; {currentTranslation?.name}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.detail_arrow} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <div className={styles.languages}>
                <div className={styles.language}>
                    {language?.nameLong}
                    <svg onClick={handleLanguageButtonClick} xmlns="http://www.w3.org/2000/svg" className={styles.dots} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg> 
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={openLanguageMenu}
                        onClose={handleClose}
                        MenuListProps={{
                        'aria-labelledby': 'basic-button',
                        }}
                        sx={{padding: 20}}
                    >
                        <div style={{padding: "0 1rem"}}>
                            <h5>Change wger's language...</h5>
                            <hr />
                            <span>For this exercise:</span>
                            {languagesList}
                        </div>
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
                <div className={styles.vertical_line}></div>
                <img src="https://img.icons8.com/ios/50/000000/forward-arrow.png" alt='forward arrow' />
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.dots} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </nav>
        </div>
    </div>
  );
};
