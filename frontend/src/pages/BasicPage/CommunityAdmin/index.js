import React from 'react';
import {FusePageSimple} from "../../../@fuse";
import CommunityAdminHeader from "./CommunityAdminHeader";
import CommunityAdminUserList from "./CommunityAdminUserList";
import CommunityAdminCardsList from "./CommunityAdminCardsList";
import CommunityAdminSidebarContent from "./CommunityAdminSidebarContent";
import {bindActionCreators} from "redux";
import * as Actions from "./store/actions";
import withReducer from "../../store/withReducer";
import reducer from "./store/reducers";
import {withRouter} from "react-router-dom";
import connect from "react-redux/es/connect/connect";
import axios from 'axios';
import config from '../../../config';
import {ErrorController} from "../../../containers/ErrorController";
import LoadingScreen from "../../../containers/Loading/LoadingScreen";
import "react-notifications/lib/notifications.css";
import {NotificationManager} from "react-notifications";
// import ViewAllUsersToInviteDialog from "./Modals/ViewAllUsersToInviteDialog";
import SimpleAlertDialog from "../../ExternalPages/SimpleAlertDialog";
import ViewCardDetailDialog from "./Modals/ViewCardDetailDialog";

class Admin extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            error: false,
            text: ''
        };
        this.onLoadingHandler = this.onLoadingHandler.bind(this);
        this.removeCards = this.removeCards.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.getAllInfo = this.getAllInfo.bind(this);
    }

    getAllInfo = () => {
        axios.get(`${config.baseURL}/api/admin/allInfo/${this.props.match.params.communityId}`, {
            headers: {
                token: localStorage.getItem('UserToken')
            }
        }).then(response => {
            if (response.data.code === 200) {
                localStorage.setItem("UserToken", JSON.stringify(response.data.token));
                this.props.getContacts(response.data.data.users, this.props.match.params);
                this.props.getActivityData(response.data.data.activities, this.props.match.params);
            } else {
                this.setState({
                    error: true,
                    text: response.data.message
                });
            }
        }).catch(ErrorController);
    };

    componentDidMount() {
        this.getAllInfo();
    }

    componentDidUpdate(prevProps, prevState, snapShot) {
        if (prevProps.match.params.communityId !== this.props.match.params.communityId) {
            this.getAllInfo();
        }
    }

    onLoadingHandler(isLoading, isSuccess, message) {
        this.setState({
            isLoading
        });
        if (!isLoading) {
            message && message !== ''
            && (isSuccess ? NotificationManager.success(message) : NotificationManager.error(message))
        }
    }

    showDialog(open) {
        this.setState({
            error: open
        })
    }

    removeCards(cardIds) {
        this.onLoadingHandler(true);
        axios.post(`${config.baseURL}/api/admin/removeCards`, {
            communityId: this.props.match.params.communityId,
            cardIds
        }, {
            headers: {
                token: localStorage.getItem("UserToken")
            }
        }).then(response => {
            if (response.data.code === 200) {
                this.props.removeCards(cardIds);
                this.onLoadingHandler(false, true, response.data.message);
            } else {
                this.onLoadingHandler(false, false, response.data.message);
            }
        }).catch(error => {
            this.onLoadingHandler(false, false, error.message);
            ErrorController(error)
        });
    }

    render() {
        return (
            <React.Fragment>
                <FusePageSimple
                    classes={{
                        contentCardWrapper: "p-16 sm:p-24 pb-80",
                        leftSidebar: "w-256 border-0",
                        header: "min-h-72 h-72 sm:h-136 sm:min-h-136"
                    }}
                    header={
                        <CommunityAdminHeader
                            pageLayout={() => this.pageLayout}/>
                    }
                    content={
                        this.props.match.url.includes('/users/')
                            ? <CommunityAdminUserList onLoading={this.onLoadingHandler}/>
                            : <CommunityAdminCardsList
                                removeCards={this.removeCards}/>
                    }
                    leftSidebarContent={
                        this.props.match.url.includes('/users/')
                        && <CommunityAdminSidebarContent onLoading={this.onLoadingHandler}/>
                    }
                    sidebarInner
                    onRef={instance => {
                        this.pageLayout = instance;
                    }}
                    innerScroll
                />
                {
                    // this.props.match.url.includes('/users/')
                    // && <ViewAllUsersToInviteDialog
                    //     onLoading={this.onLoadingHandler}
                    //     communityId={this.props.match.params.communityId}/>
                }
                <ViewCardDetailDialog
                    removeCards={this.removeCards}
                />
                <LoadingScreen isLoading={this.state.isLoading} value={0}/>
                {
                    this.state.error
                    && <SimpleAlertDialog
                        open={this.state.error}
                        showDialog={this.showDialog}
                        text={this.state.text}/>
                }
            </React.Fragment>
        )
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getContacts: Actions.getContacts,
        getActivityData: Actions.getActivityData,
        removeCards: Actions.removeCards,
    }, dispatch);
}

export default withReducer('CommunityAdminStates', reducer)(withRouter(connect(null, mapDispatchToProps)(Admin)));
