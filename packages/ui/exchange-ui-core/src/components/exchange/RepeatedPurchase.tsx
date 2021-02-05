import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Grid, InputAdornment, Divider } from '@material-ui/core';
import {
    useValidation,
    useTranslation,
    getUserOffchain,
    LightenColor
} from '@energyweb/origin-ui-core';
import { FormInput, CalendarFieldOnPeriod, FormSelect } from '../Form';
import { getExchangeClient } from '../../features/general';
import { periodTypeOptions } from '../../utils/demand';
import { calculateTotalVolume } from '../../utils/exchange';
import { useOriginConfiguration } from '../../utils/configuration';

export const RepeatedPurchase = (props) => {
    const {
        fieldDisabled,
        currency,
        setFieldValue,
        energyUnit,
        values,
        setValidationSchema
    } = props;
    const { t } = useTranslation();
    const { Yup } = useValidation();
    const exchangeClient = useSelector(getExchangeClient);
    const user = useSelector(getUserOffchain);
    const originConfiguration = useOriginConfiguration();
    const originBgColor = originConfiguration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const bgColorLighten = LightenColor(originBgColor, 5);

    const periodOptions = periodTypeOptions(t);

    const VALIDATION_SCHEMA = Yup.object().shape({
        demandPeriod: Yup.number().label(t('exchange.properties.period')),
        demandVolume: Yup.number().positive().integer().label(t('exchange.properties.volume')),
        demandDateStart: Yup.date().label(t('exchange.properties.demandStartDate')),
        demandDateEnd: Yup.date().label(t('exchange.properties.demandEndDate')),
        totalDemandVolume: Yup.number()
            .positive()
            .integer()
            .label(t('exchange.properties.totalVolume')),
        price: Yup.number().positive().min(0.01).label(t('exchange.properties.price'))
    });

    useEffect(() => {
        setValidationSchema(VALIDATION_SCHEMA);
        const { demandPeriod, demandVolume, demandDateStart, demandDateEnd } = values;

        const setVolume = async () => {
            const totalVolume = await calculateTotalVolume(exchangeClient.demandClient, {
                volume: demandVolume,
                period: demandPeriod,
                start: demandDateStart,
                end: demandDateEnd
            });
            setFieldValue('totalDemandVolume', totalVolume);
        };
        setVolume();
    }, [values]);

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <FormSelect
                        options={periodOptions}
                        label={t('exchange.properties.period')}
                        property="demandPeriod"
                        currentValue={values.demandPeriod}
                        disabled={fieldDisabled}
                        className="mt-3"
                        required
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormInput
                        label={t('exchange.properties.volume')}
                        property="demandVolume"
                        disabled={!user || fieldDisabled}
                        className="mt-3"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">{energyUnit}</InputAdornment>
                            )
                        }}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <CalendarFieldOnPeriod
                        name={'demandDateStart'}
                        label={t('exchange.properties.demandStartDate')}
                        period={values.demandPeriod}
                    />
                </Grid>
                <Grid item xs={6}>
                    <CalendarFieldOnPeriod
                        name={'demandDateEnd'}
                        label={t('exchange.properties.demandEndDate')}
                        period={values.demandPeriod}
                    />
                </Grid>
            </Grid>
            <br />
            <Divider variant="fullWidth" style={{ backgroundColor: bgColorLighten }} />
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <FormInput
                        label={t('exchange.properties.totalVolume')}
                        property="totalDemandVolume"
                        className="mt-3"
                        disabled
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">{energyUnit}</InputAdornment>
                            )
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormInput
                        label={t('exchange.properties.price')}
                        property="price"
                        disabled={!user || fieldDisabled}
                        className="mt-3"
                        required
                        InputProps={{
                            endAdornment: <InputAdornment position="end">{currency}</InputAdornment>
                        }}
                        wrapperProps={{
                            onBlur: (e) => {
                                const parsedValue = parseFloat((e.target as any)?.value);

                                if (!isNaN(parsedValue) && parsedValue > 0) {
                                    setFieldValue('price', parsedValue.toFixed(2));
                                }
                            }
                        }}
                    />
                </Grid>
            </Grid>
        </>
    );
};
