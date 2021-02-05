import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    Grid
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { getNoAccountModalVisibility } from '../../features/general/selectors';
import { setNoAccountModalVisibilityAction } from '../../features/general/actions';
import { useTranslation } from '../../utils';

export function NoBlockchainAccountModal() {
    const visibility = useSelector(getNoAccountModalVisibility);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const handleClose = () => dispatch(setNoAccountModalVisibilityAction(false));

    return (
        <Dialog open={visibility} onClose={handleClose}>
            <DialogTitle>{t('general.feedback.noBlockchainAccount')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            {`1. ${t('general.info.noBlockchainAccount1')}`}
                        </Grid>
                        <Grid item xs={12}>
                            {`2. ${t('general.info.noBlockchainAccount2')}`}
                        </Grid>
                    </Grid>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={handleClose}>
                    {t('general.actions.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
