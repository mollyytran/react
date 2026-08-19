import { Button, Stack, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import { useAddWeightEntryQuery, useBodyWeightQuery, useEditWeightEntryQuery } from "@/components/Weight/queries";
import { useProfileQuery } from "@/components/User";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { Form, Formik } from "formik";
import { DateTime } from "luxon";
import { useState } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface WeightFormProps {
    weightEntry?: WeightEntry,
    closeFn?: () => void,
}

export const WeightForm = ({ weightEntry, closeFn }: WeightFormProps) => {

    const weightEntriesQuery = useBodyWeightQuery();
    const addWeightQuery = useAddWeightEntryQuery();
    const editWeightQuery = useEditWeightEntryQuery();
    const profileQuery = useProfileQuery();

    const [dateValue, setDateValue] = useState<DateTime | null>(weightEntry ? DateTime.fromJSDate(weightEntry.date) : DateTime.now);
    const [t, i18n] = useTranslation();

    const isMetric = profileQuery.data?.useMetric ?? true;
    const KG_TO_LB = 2.20462;
    const minWeight = isMetric ? 30 : Math.round(30 * KG_TO_LB);
    const maxWeight = isMetric ? 600 : Math.round(600 * KG_TO_LB);
    const unitLabel = isMetric ? 'kg' : 'lb';

    const validationSchema = yup.object({
        weight: yup
            .number()
            .min(minWeight, `Min weight is ${minWeight} ${unitLabel}`)
            .max(maxWeight, `Max weight is ${maxWeight} ${unitLabel}`)
            .required('Weight field is required'),
    });

    if (weightEntriesQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return (
        (<Formik
            initialValues={{
                weight: weightEntry
                    ? (isMetric ? weightEntry.weight : Math.round(weightEntry.weight * KG_TO_LB))
                    : 0,
                date: weightEntry ? weightEntry.date : new Date(),
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // Convert to kg if user is in imperial mode before sending to API
                const weightInKg = isMetric
                    ? values.weight
                    : parseFloat((values.weight / KG_TO_LB).toFixed(2));

                // Edit existing weight entry
                if (weightEntry) {
                    editWeightQuery.mutate(WeightEntry.clone(
                        weightEntry,
                        { weight: weightInKg, date: values.date }
                    ));

                // Create a new weight entry
                } else {
                    addWeightQuery.mutate(new WeightEntry(values.date, weightInKg));
                }

                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            id="weight"
                            label={t('weight')}
                            error={formik.touched.weight && Boolean(formik.errors.weight)}
                            helperText={formik.touched.weight && formik.errors.weight}
                            slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                            {...formik.getFieldProps('weight')}
                        />

                        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                            <DateTimePicker
                                label={t('date')}
                                value={dateValue}
                                slotProps={{ textField: { variant: 'outlined' } }}
                                disableFuture={true}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        formik.setFieldValue('date', newValue.toJSDate());
                                    }
                                    setDateValue(newValue);
                                }}
                            />
                        </LocalizationProvider>
                        <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                            <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>)
    );
};