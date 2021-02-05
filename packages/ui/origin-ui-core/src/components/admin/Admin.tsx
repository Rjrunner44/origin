import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route } from 'react-router-dom';
import { useLinks } from '../../utils';
import { PageContent } from '../PageContent/PageContent';
import { adminMenuCreator } from './adminMenuCreator';

export function Admin() {
    const { baseURL, getAdminLink } = useLinks();
    const { t } = useTranslation();

    const adminMenuList = adminMenuCreator(t);

    return (
        <div className="PageWrapper">
            <Route
                path={`${getAdminLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const matches = adminMenuList.filter((item) => {
                        return item.key === key;
                    });

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getAdminLink()}
                        />
                    );
                }}
            />
            <Route
                exact={true}
                path={getAdminLink()}
                render={() => (
                    <Redirect to={{ pathname: `${getAdminLink()}/${adminMenuList[0].key}` }} />
                )}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => (
                    <Redirect to={{ pathname: `${getAdminLink()}/${adminMenuList[0].key}` }} />
                )}
            />
        </div>
    );
}
