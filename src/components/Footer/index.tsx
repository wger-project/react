import React from 'react';
import styles from './footer.module.css';
import logo from 'assets/images/logo.png';
import DiscordLogo from 'assets/images/discord-logo.svg';
import TwitterLogo from 'assets/images/twitter.svg';
import playstoreLogo from 'assets/images/get-it-on-google-play.svg';
import EditIcon from '@mui/icons-material/Edit';
import { MobileLinks } from './MobileLinks';

export const Footer = () => {

    const mobileFooter = (
        <footer className={styles.mobileFooter}>
            <div>
                <a href="/" className={styles.logo}>
                    <img src={logo} alt="logo" />
                    <span>wger</span>
                </a>
            </div>
            <div>
                <div>
                    <MobileLinks title="Account" links={[
                        { text: "Sign up", url: "signup" },
                        { text: "Register", url: "register" },
                        { text: "Dashboard", url: "dashboard" },
                        { text: "Training", url: "training" },
                        { text: "Weight", url: "weight" },
                        { text: "Nutrition", url: "nutrtion" }]}
                    />
                </div>
                <div>
                    <MobileLinks title="Community" links={[
                        { text: "Exercises", url: "exercises" },
                        { text: "Workout plans", url: "workoutplans" },
                        { text: "Exercise translations", url: "translations" }]}
                    />
                </div>
                <div>
                    <MobileLinks title="Software" links={[
                        { text: "Report an issue", url: "reportissue" },
                        { text: "Source code", url: "sourcecode" },
                        { text: "Software translations", url: "softwaretranslation" },
                        { text: "REST API", url: "restapi" },
                        { text: "Documentation", url: "documentation" }]}
                    />
                </div>
            </div>

            {/* Line break */}
            <hr />

            <div className={styles.external_links}>
                <div>
                    <a href="#"><img className={styles.social_logo} src={TwitterLogo} alt="twitter" /></a>
                    <a href="#"><img className={styles.social_logo} src={DiscordLogo} alt="discord" /></a>
                </div>
                <a href="#" className={styles.mobileFooter__link}>Terms of Service</a>
                <a href="#" className={styles.mobileFooter__link}>Privacy policy</a>
            </div>

            {/* Line break */}
            <hr />

            <div className={styles.mobileFooter__tools}>
                <div className={styles.mobileFooter__language}>
                    English <EditIcon />
                </div>
                <div className={styles.mobileFooter__playstore}>
                    <a href="#">
                        <img src={playstoreLogo} alt="playstore link" />
                    </a>
                </div>
            </div>
        </footer>
    );

    return (
        <>
            {mobileFooter}
            <footer className={styles.footer}>
                <div className={styles.logo_wrapper}>
                    <a href="/" className={styles.logo}>
                        <img src={logo} alt="logo" />
                        <span>wger</span>
                    </a>
                </div>

                {/* 4 columns of links */}
                <div className={styles.footer__links}>
                    <div>
                        <h3>Account</h3>
                        <a href="#" className={styles.footer__link}>Sign up</a>
                        <a href="#" className={styles.footer__link}>Register</a>
                        <a href="#" className={styles.footer__link}>Dashboard</a>
                        <a href="#" className={styles.footer__link}>Training</a>
                        <a href="#" className={styles.footer__link}>Weight</a>
                        <a href="#" className={styles.footer__link}>Nutrition</a>
                    </div>
                    <div>
                        <h3>Community</h3>
                        <a href="#" className={styles.footer__link}>Exercises</a>
                        <a href="#" className={styles.footer__link}>Workout plans</a>
                        <a href="#" className={styles.footer__link}>Exercise translations</a>
                    </div>
                    <div>
                        <h3>Software</h3>
                        <a href="#" className={styles.footer__link}>Report an issue</a>
                        <a href="#" className={styles.footer__link}>Source code</a>
                        <a href="#" className={styles.footer__link}>Software translations</a>
                        <a href="#" className={styles.footer__link}>REST API</a>
                        <a href="#" className={styles.footer__link}>Documentation</a>
                    </div>
                    <div>
                        <h3>Discord</h3>
                        <a href="#" className={styles.footer__link}>Terms of Service</a>
                        <a href="#" className={styles.footer__link}>Privacy policy</a>
                    </div>
                </div>

                {/* Line break */}
                <hr />

                <div className={styles.footer__tools}>
                    <div className={styles.footer__language}>
                        English <EditIcon />
                    </div>
                    <div className={styles.footer__playstore}>
                        <a href="https://play.google.com/store/apps/details?id=de.wger.flutter">
                            <img src={playstoreLogo} alt="playstore link" />
                        </a>
                    </div>
                </div>

            </footer>
        </>
    );
};
