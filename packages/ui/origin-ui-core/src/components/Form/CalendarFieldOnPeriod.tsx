import React from 'react';
import { Field } from 'formik';
import { FormikDatePicker } from '.';
import { InputAdornment } from '@material-ui/core';
import { CalendarToday } from '@material-ui/icons';
import { TimeFrame } from '@energyweb/utils-general';

interface IProps {
    name: string;
    label: string;
    period: TimeFrame;
}

export const CalendarFieldOnPeriod = (props: IProps) => {
    const { name, label, period } = props;

    const view: string[] = [];

    switch (period) {
        case TimeFrame.Monthly:
            view.push('year', 'month');
            break;
        case TimeFrame.Yearly:
            view.push('year');
            break;
    }

    if (view.length > 0) {
        return (
            <Field
                name={name}
                label={label}
                className="mt-3"
                inputVariant="filled"
                variant="inline"
                fullWidth
                required
                views={view}
                component={FormikDatePicker}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <CalendarToday />
                        </InputAdornment>
                    )
                }}
            />
        );
    } else {
        return (
            <Field
                name={name}
                label={label}
                className="mt-3"
                inputVariant="filled"
                variant="inline"
                fullWidth
                required
                component={FormikDatePicker}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <CalendarToday />
                        </InputAdornment>
                    )
                }}
            />
        );
    }
};
