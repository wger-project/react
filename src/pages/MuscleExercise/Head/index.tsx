import React from 'react';
import { Link } from 'react-router-dom';
import styles from './head.module.css';

export const Head = () => {
  return (
    <div className={styles.root}>
        <div className={styles.detail_language}>
            <div className={styles.detail}>
                <Link to='/exercises'>Exercise</Link>  &gt; 4-count burpees
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.detail_arrow} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <div className={styles.language}>
                EN(Original)
                &nbsp;
                &nbsp;
                &nbsp;
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.dots} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </div>
        </div>
        <div className={styles.header}>
            <div className={styles.heading}>
                <h1>4-count burpees</h1>
                <div>
                    <span>Chest</span> No equipment
                </div>
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
