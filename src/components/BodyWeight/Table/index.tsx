import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Theme
} from '@mui/material';
import { BodyWeightType } from 'types';
import { process_weight } from '../utils';
// import styles from './table.module.css'
import { ActionButton } from './ActionButton';
import { makeStyles } from '@mui/styles';
// import DateObject from "react-date-object";


interface WeightTableProps {
    weights: BodyWeightType[]
}

export interface ProcessedWeight {
    date: Date,
    weight: number,
    change: number,
    days: number,
    id: number
}

const useStyles = makeStyles((theme: Theme) => {
  return {
      table: {
        
        "& .MuiPaper-root": { 
          border: "1px solid #bababa",
          overflowX: 'visible' // this class is for the drop down menu of the actions button to be fully visible
        }
      },
  }
});

function createData(
    date: Date,
    weight: number,
    change: number,
    days: number,
    id: number,
) {
    return {date, weight, change, days, id};
}

export const WeightTable = ({weights}: WeightTableProps) => {
    const classes = useStyles();
  
    const processed_weights = process_weight(weights);
      
    // map to produce rows data for the table
    const rows: ProcessedWeight[] = processed_weights.map(weight => {
        return createData(weight.date, weight.weight, weight.change, weight.days, weight.id)
    })    

  return (
    <div className={classes.table}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Date</TableCell>
              <TableCell align="center">Weight</TableCell>
              <TableCell align="center">Change</TableCell>
              <TableCell align="center">Days</TableCell>
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.date.toLocaleDateString()}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" align="center">
                  {row.date.toLocaleDateString()}
                </TableCell>
                <TableCell align="center">{row.weight}</TableCell>
                <TableCell align="center">{row.change}</TableCell>
                <TableCell align="center">{row.days}</TableCell>
                <TableCell align="center"><ActionButton weight={row} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}