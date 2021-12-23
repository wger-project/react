import React, { useEffect} from 'react';
import {getWeights} from 'services';
import {WeightTable} from './Table';
import styles from './body_weight.module.css';
import {setWeights, useStateValue} from 'state';

export const BodyWeight = () => {
    const [state, dispatch] = useStateValue();

    useEffect(() => {
        const fecthWeights = async () => {
            try {
                const receivedWeights = await getWeights();
                dispatch(setWeights(receivedWeights));
            } catch (error) {
                console.log(error);
            }
        };
        fecthWeights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
        

    return (
        <div className={styles.root}>
            <div className={styles.chart}>Chart Here</div>
            <WeightTable weights={state.weights}/>
        </div>
    );
};