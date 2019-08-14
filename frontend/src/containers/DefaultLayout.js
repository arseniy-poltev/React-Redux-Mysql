import React, {Component, Suspense} from "react";
import {Redirect, Route, Switch, withRouter} from "react-router-dom";
import {Container} from "reactstrap";

import {AppHeader, AppSidebar, AppSidebarNav} from "@coreui/react";
// sidebar nav config
import {getNav} from "./_nav";
// routes config
import getRoutes from "./routes";

import WelcomeModals from "./SplashScreen/WelcomeModals";
import DefaultHeader from "./DefaultHeader";
import UnJoinedCommunitiesModal from "./UnJoinedCommunitiesModal";
import "react-notifications/lib/notifications.css";
import {
    NotificationContainer,
} from "react-notifications";

class DefaultLayout extends Component {

    constructor(props) {
        super(props);
        const userInfo = localStorage.getItem("UserInfo") && localStorage.getItem("UserInfo") !== ''
            ? JSON.parse(localStorage.getItem("UserInfo"))
            : null;
        if (userInfo && !userInfo.communities) {
            localStorage.clear();
            window.location.reload();
        }
        this.state = {
            userInfo,
            isOpen: false,
            firstCommunityId: userInfo && userInfo.communities.length > 0 ? userInfo.communities[0].id : null,
            routes: getRoutes(userInfo),
            navigation: userInfo ? <AppSidebarNav navConfig={getNav(userInfo)} {...this.props} /> : null
        };
        this.toggle = this.toggle.bind(this);
    }

    loading = () => (
        <div className="animated fadeIn pt-1 text-center">Loading...</div>
    );

    signOut(e) {
        e.preventDefault();
        localStorage.clear();
        this.props.history.push("/login");
    }

    toggle(isOpen) {
        this.setState({isOpen})
    }

    componentDidMount() {
        !this.state.firstCommunityId && this.toggle(true);
    }

    render() {
        const token = localStorage.getItem("UserToken");
        return (
            <div id="dashboard" className="app">
                <AppSidebar fixed display="lg">
                    <Suspense fallback={this.loading()}>
                        <img
                            alt="logo"
                            style={{cursor: 'pointer'}}
                            onClick={() => this.props.history.push("/")}
                            src={require('../assets/logo.png')}/>
                        <AppSidebarNav
                            navConfig={getNav(JSON.parse(localStorage.getItem("UserInfo")))} {...this.props} />
                    </Suspense>
                </AppSidebar>
                <main className="main" style={{height: '100%', maxWidth: '100%'}}>
                    <AppHeader fixed>
                        {token && token !== '' && token !== undefined &&
                        <Suspense fallback={this.loading()}>
                            <DefaultHeader toggle={this.toggle} onLogout={e => this.signOut(e)}/>
                        </Suspense>
                        }
                    </AppHeader>
                    <Container fluid className="m-2">
                        {token && token !== '' && token !== undefined ?
                            <Suspense fallback={this.loading()}>
                                <Switch>
                                    {this.state.routes.map((route, idx) => route.component ? (
                                            <Route
                                                key={idx}
                                                path={route.path}
                                                exact={route.exact}
                                                name={route.name}
                                                render={props => <route.component {...props} />}
                                            />
                                        ) : null
                                    )}
                                    {this.state.firstCommunityId
                                    && <Redirect from="/" to={"/dashboard/" + this.state.firstCommunityId}/>}
                                </Switch>
                            </Suspense> : <Redirect to="/login"/>
                        }
                    </Container>
                </main>
                <WelcomeModals/>
                <UnJoinedCommunitiesModal isOpen={this.state.isOpen} toggle={this.toggle}/>
                <NotificationContainer/>
            </div>
        );
    }
}

export default withRouter(DefaultLayout);