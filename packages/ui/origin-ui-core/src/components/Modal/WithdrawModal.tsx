import { ProducingDevice } from '@energyweb/device-registry';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@material-ui/core';
import { BigNumber } from 'ethers';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { resyncCertificate, requestWithdrawCertificate } from '../../features/certificates';
import { ICertificateViewItem } from '../../features/certificates/types';
import { getEnvironment } from '../../features/general/selectors';
import { getUserOffchain } from '../../features/users/selectors';
import { EnergyFormatter, formatDate, countDecimals } from '../../utils';
import { IEnvironment } from '../../features/general';

interface IProps {
    certificate: ICertificateViewItem;
    producingDevice: ProducingDevice.Entity;
    showModal: boolean;
    callback: () => void;
}

export function WithdrawModal(props: IProps) {
    const { certificate, callback, producingDevice, showModal } = props;
    const user = useSelector(getUserOffchain);
    const environment: IEnvironment = useSelector(getEnvironment);
    const DEFAULT_ENERGY_IN_BASE_UNIT = BigNumber.from(
        Number(environment?.DEFAULT_ENERGY_IN_BASE_UNIT || 1)
    );
    const [energyInDisplayUnit, setEnergyInDisplayUnit] = useState(
        EnergyFormatter.getValueInDisplayUnit(DEFAULT_ENERGY_IN_BASE_UNIT)
    );
    const [validation, setValidation] = useState({
        energyInDisplayUnit: true
    });

    const dispatch = useDispatch();

    useEffect(() => {
        if (certificate) {
            setEnergyInDisplayUnit(
                EnergyFormatter.getValueInDisplayUnit(certificate.energy.publicVolume)
            );
        }
    }, [certificate, user]);

    async function handleClose() {
        dispatch(resyncCertificate(certificate));
        callback();
    }

    async function validateInputs(event) {
        switch (event.target.id) {
            case 'energyInDisplayUnitInput':
                const newEnergyInDisplayUnit = Number(event.target.value);
                const newEnergyInBaseValueUnit = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                    newEnergyInDisplayUnit
                );

                const ownedPublicVolume = certificate.energy.publicVolume;

                const energyInDisplayUnitValid =
                    newEnergyInBaseValueUnit.gte(1) &&
                    newEnergyInBaseValueUnit.lt(ownedPublicVolume) &&
                    countDecimals(newEnergyInDisplayUnit) <= 6;

                setEnergyInDisplayUnit(newEnergyInDisplayUnit);

                setValidation({
                    ...validation,
                    energyInDisplayUnit: energyInDisplayUnitValid
                });
                break;
        }
    }

    const isFormValid = validation.energyInDisplayUnit;

    async function withdraw() {
        if (!isFormValid) {
            return;
        }
        const assetId = certificate.assetId;
        const address = user.blockchainAccountAddress;
        const amount = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
            energyInDisplayUnit
        ).toString();
        dispatch(
            requestWithdrawCertificate({
                assetId,
                address,
                amount,
                callback
            })
        );
    }

    const certificateId = certificate ? certificate.id : '';
    const facilityName = producingDevice ? producingDevice.facilityName : '';

    let creationTime: string;

    try {
        creationTime = certificate && formatDate(moment.unix(certificate.creationTime), true);
    } catch (error) {
        console.error('Error: Can not get creation time', error);
    }

    return (
        <Dialog open={showModal} onClose={handleClose}>
            <DialogTitle>{`Withdraw #${certificateId}`}</DialogTitle>
            <DialogContent>
                <TextField label="Facility" value={facilityName} fullWidth disabled />

                {creationTime && (
                    <>
                        <TextField
                            label="Creation time"
                            value={creationTime}
                            fullWidth
                            disabled
                            className="mt-4"
                        />
                    </>
                )}

                <TextField
                    label={EnergyFormatter.displayUnit}
                    type="number"
                    value={energyInDisplayUnit}
                    className="mt-4"
                    id="energyInDisplayUnitInput"
                    onChange={(e) => validateInputs(e)}
                    placeholder="1"
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={withdraw} color="primary" disabled={!isFormValid}>
                    Withdraw
                </Button>
            </DialogActions>
        </Dialog>
    );
}
