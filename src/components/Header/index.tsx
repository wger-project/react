import React, { useState } from 'react';
import styles from './header.module.css';
import { useMediaQuery } from 'react-responsive';
import logo from 'assets/images/logo.png';


export const Header = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [showTraining, setShowTraining] = useState(false);
    const [showBodyWeight, setShowBodyWeight] = useState(false);
    const [showNutrition, setShowNutrition] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const isDesktop = useMediaQuery({ query: `(min-width: 700px)` });    

    const showMenuStyle: React.CSSProperties = !isDesktop ? showMenu ? {} : {
        maxHeight: "0",
    } : {
        maxHeight: "auto"
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <a href='/' className={styles.logo}>
                    <img src={logo} alt="logo" />
                </a>
                <div 
                    style={showMenuStyle}
                    className={styles.navs}
                >
                    <nav className={styles.primaryNav}>
                        <ul className={styles.primaryNav__list}>
                            <li className={styles.nav__item}>
                                <button
                                    onClick={() => setShowTraining(!showTraining)}
                                    onBlur={() => setShowTraining(false)}
                                >
                                    Training <span>&#9660;</span>
                                </button>
                                <ul className={styles.subNav} style={{display: showTraining ? "block" : "none"}}>
                                    <div>
                                        <li><a href="/">Workout</a></li>
                                        <li><a href="/">Workout Schedule</a></li>
                                        <li><a href="/">Calendar</a></li>
                                        <li><a href="/">Gallery</a></li>
                                    </div>
                                    <div>
                                        <p>Workout templates</p>
                                        <li><a href="/">Your Templates</a></li>
                                        <li><a href="/">Public Templates</a></li>
                                    </div>
                                    <div>
                                        <p>Exercises</p>
                                        <li><a href="/">by category</a></li>
                                        <li><a href="/">by muscle</a></li>
                                        <li><a href="/">by equipment</a></li>
                                    </div>
                                    <div><li><a href="/">Add new exercise</a></li></div>
                                </ul>
                            </li>
                            <li className={styles.nav__item}>
                                <button
                                    onClick={() => setShowBodyWeight(!showBodyWeight)}
                                    onBlur={() => setShowBodyWeight(false)}
                                >
                                    Body Weight <span>&#9660;</span>
                                </button>
                                <ul className={styles.subNav} style={{display: showBodyWeight ? "block" : "none"}}>
                                    <li><a href="/">Weight Overview</a></li>
                                    <li><a href="/">Add Weight</a></li>
                                </ul>
                            </li>
                            <li className={styles.nav__item}>
                                <button
                                    onClick={() => setShowNutrition(!showNutrition)}
                                    onBlur={() => setShowNutrition(false)}
                                >
                                    Nutrition <span>&#9660;</span>
                                </button>
                                <ul className={styles.subNav} style={{display: showNutrition ? "block" : "none"}}>
                                    <li><a href="/">Nutritions Plan</a></li>
                                    <li><a href="/">BMI Calculator</a></li>
                                    <li><a href="/">Daily calories calculator</a></li>
                                    <li><a href="/">Ingredient overview</a></li>
                                </ul>
                            </li>
                            <li className={styles.nav__item}>
                                <button
                                    onClick={() => setShowAbout(!showAbout)}
                                    onBlur={() => setShowAbout(false)}
                                >
                                    About this software <span>&#9660;</span>
                                </button>
                                <ul className={styles.subNav} style={{display: showAbout ? "block" : "none"}}>
                                    <div className={styles.about}>About us</div>
                                    <li>
                                        <a href="/">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                                License
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Developer documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Get the code (Github)
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Translate
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </nav>
                    <nav className={styles.secondaryNav}>
                    <ul className={styles.secondaryNav__list}>
                        <li className={styles.nav__item}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                onBlur={() => setShowUserMenu(false)}
                            >
                                User <span>&#9660;</span>
                            </button>
                            <ul className={styles.subNav} style={{display: showUserMenu ? "block" : "none"}}>
                                <li><a href="/"> My Preferences</a></li>
                                <li><a href="/"> 
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </a></li>
                            </ul>
                        </li>
                    </ul>
                    </nav>
                </div>
                <button className={styles.toggleBtn}  onClick={() => setShowMenu(!showMenu)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
    );
};