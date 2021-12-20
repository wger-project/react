import React, {useEffect} from 'react';
import {get_weights} from 'services'
import {WeightTable} from './Table';
import styles from './body_weight.module.css';
import {setWeights, useStateValue} from 'state';

export const BodyWeight = () => {
    const [state, dispatch] = useStateValue()

    useEffect(() => {
        const fecth_weights = async () => {
            try {
                const received_weights = await get_weights();
                console.log(received_weights);
                dispatch(setWeights(received_weights))
            } catch (error) {
                console.log(error);
            }
        }
        fecth_weights()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div className={styles.root}>
            <div className={styles.chart}>Chart Here</div>
            {state.weights.length !== 0 && <WeightTable weights={state.weights}/>}
        </div>
    )
}