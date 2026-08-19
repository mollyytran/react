import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import React from 'react';
import { useTranslation } from "react-i18next";
import { dateTimeToLocale } from "@/core/lib/date";
import { useProfileQuery } from "@/components/User";


const PREFIX = 'WeightTableDashboard';
const classes = {
    table: `${PREFIX}-table`
};

const Root = styled('div')(() => {
    return {
        [`&.${classes.table}`]: {
            "& .MuiPaper-root": {
                border: "1px solid #bababa",

            }
        },
    };
});


export interface WeightTableProps {
    weights: WeightEntry[];
}

export const WeightTableDashboard = ({ weights }: WeightTableProps) => {
    const [t] = useTranslation();

    const profileQuery = useProfileQuery();
    const isMetric = profileQuery.data?.useMetric ?? true;

    const WEIGHT_ENTRIES_TO_SHOW = 5;

    const filteredWeight = weights.slice(0, WEIGHT_ENTRIES_TO_SHOW);

    const KG_TO_LB = 2.20462;

    return (
        <Root className={classes.table}>
            <TableContainer>
                <Table size={"small"}>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('date')}</TableCell>
                            <TableCell>{t('weight')} ({isMetric ? 'kg' : 'lb'})</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredWeight.map((row) => (
                            <TableRow key={row.date.toISOString()}>
                                <TableCell>{dateTimeToLocale(row.date)}</TableCell>
                                <TableCell>{isMetric ? row.weight : Math.round(row.weight * KG_TO_LB)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Root>
    );
};