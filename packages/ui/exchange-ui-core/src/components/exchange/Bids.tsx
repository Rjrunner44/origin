import React from 'react';
import { useTranslation } from '@energyweb/origin-ui-core';
import { Orders, IOrdersProps } from './Orders';

export function Bids(props: IOrdersProps) {
    const { currency, data, title, highlightOrdersUserId, ordersTotalVolume } = props;
    const { t } = useTranslation();
    const popoverText = [
        t('exchange.popover.bidsDescription'),
        t('exchange.popover.bidsFurtherInstructions')
    ];

    return (
        <Orders
            data={data}
            currency={currency}
            title={title}
            highlightOrdersUserId={highlightOrdersUserId}
            ordersTotalVolume={ordersTotalVolume}
            popoverText={popoverText}
        />
    );
}
