import React from 'react';
import axios from 'axios';
import config from "../../../config";
import {ErrorController} from "../../../containers/ErrorController";
import {NotificationManager} from "react-notifications";
import LoadingScreen from "../../../containers/Loading/LoadingScreen";
import {bindActionCreators} from "redux";
import * as Actions from "./store/actions";
import withReducer from "../../store/withReducer";
import reducer from "./store/reducers";
import connect from "react-redux/es/connect/connect";
import {FusePageSimple} from "../../../@fuse";
import SuperAdminCommunitiesList from "./SuperAdminCommunitiesList";
import ViewCommunityDetailDialog from "./Modals/ViewCommunityDetailDialog";
import SimpleAlertDialog from "../../ExternalPages/SimpleAlertDialog";
import SuperAdminHeader from "./SuperAdminHeader";

class SuperAdmin extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            error: false,
            text: ''
        };
        this.onLoadingHandler = this.onLoadingHandler.bind(this);
        this.removeCommunities = this.removeCommunities.bind(this);
        this.showDialog = this.showDialog.bind(this);
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

    componentDidMount() {
        this.onLoadingHandler(true);
        axios.get(`${config.baseURL}/api/super/all`, {
            headers: {
                token: localStorage.getItem('UserToken')
            }
        }).then(response => {
            if (response.data.code === 200) {
                localStorage.setItem("UserToken", JSON.stringify(response.data.token));
                this.onLoadingHandler(false, true);
                this.props.getCommunities(response.data.data);
            } else {
                this.onLoadingHandler(false, false, response.data.message);
                this.setState({
                    error: true,
                    text: response.data.message
                });
            }
        }).catch(error => {
            this.onLoadingHandler(false, false, error.message);
            ErrorController(error)
        });
    }

    showDialog(open) {
        this.setState({
            error: open
        })
    }

    removeCommunities(communityIds) {
        this.onLoadingHandler(true);
        axios.post(`${config.baseURL}/api/super/community-remove`, {
            communityIds
        }, {
            headers: {
                token: localStorage.getItem('UserToken')
            }
        }).then(response => {
            if (response.data.code === 200) {
                this.onLoadingHandler(false, true);
                this.props.removeCommunities(communityIds);
                const userInfo = JSON.parse(localStorage.getItem('UserInfo'));
                userInfo.communities = userInfo.communities.filter(community => !communityIds.includes(community.id));
                localStorage.setItem('UserInfo', JSON.stringify(userInfo));
            } else {
                this.onLoadingHandler(false, false, response.data.message);
                this.setState({
                    error: true,
                    text: response.data.message
                });
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
                        <SuperAdminHeader
                            pageLayout={() => this.pageLayout}/>
                    }
                    content={<SuperAdminCommunitiesList removeCommunities={this.removeCommunities}/>}
                    sidebarInner
                    onRef={instance => {
                        this.pageLayout = instance;
                    }}
                    innerScroll
                />
                <ViewCommunityDetailDialog
                    removeCommunities={this.removeCommunities}
                    onLoadingHandler={this.onLoadingHandler}
                />
                <LoadingScreen isLoading={this.state.isLoading} value={0}/>
                {
                    this.state.error
                    && <SimpleAlertDialog
                        open={this.state.error}
                        showDialog={this.showDialog}
                        text={this.state.text}/>
                }
                <LoadingScreen isLoading={this.state.isLoading} value={0}/>
            </React.Fragment>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        getCommunities: Actions.getCommunities,
        removeCommunities: Actions.removeCommunities
    }, dispatch);
};


export default withReducer('SuperAdminStates', reducer)(connect(null, mapDispatchToProps)(SuperAdmin));
