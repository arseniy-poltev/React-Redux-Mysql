import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Tab, Tabs} from '@material-ui/core';
import {FusePageSimple} from '../../../@fuse';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom'
import {bindActionCreators} from 'redux';
import withReducer from '../../store/withReducer';
import * as Actions from './store/actions'
import reducer from './store/reducers';
import TabPostedData from "./TabPostedData";
import TabAcceptedData from "./TabAcceptedData";
import axios from "axios";
import config from "../../../config";
import {clearAllBodyScrollLocks, enableBodyScroll} from "body-scroll-lock";
import './style.css';
import MyActivityHeader from "./MyActivityHeader";
import {ErrorController} from "../../../containers/ErrorController";

const styles = theme => ({
        tooltip: {
            margin: theme.spacing.unit,
        },
        content: {
            '& canvas': {
                maxHeight: '100%'
            }
        },
        selectedProject: {
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: '8px 0 0 0'
        },
        projectMenuButton: {
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: '0 8px 0 0',
            marginLeft: 1
        },
        root: {
            flexGrow: 1,
            backgroundColor: theme.palette.background.paper,
        },
        tabsRoot: {
            borderBottom: '1px solid #dcdcdc',
            width: '100%'
        },
        tabsIndicator: {
            backgroundColor: '#1890ff',
        },
        tabRoot: {
            textTransform: 'unset',
            minWidth: 72,
            fontWeight: theme.typography.fontWeightRegular,
            marginRight: theme.spacing.unit * 4,
            fontFamily: [
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
            ].join(','),
            '&:hover': {
                color: '#40a9ff',
                opacity: 1,
            },
            '&$tabSelected': {
                color: '#1890ff',
                fontWeight: theme.typography.fontWeightMedium,
            },
            '&:focus': {
                color: '#40a9ff',
            },
        },
        tabSelected: {},
        typography: {
            padding: theme.spacing.unit * 3,
        },
    }
);

class MyActivity extends Component {
    state = {
        tabValue: 0,
        selectedProjectId: 1,
        projectMenuEl: null,
        targetElements: null
    };

    handleChangeTab = (event, tabValue) => {
        this.setState({tabValue});
    };

    componentWillUnmount() {
        clearAllBodyScrollLocks();
    }

    componentDidMount() {
        this.getAllActivities();
    }

    getAllActivities() {
        this.setState({
            targetElements: document.querySelector('#my-activity')
        });
        const _this = this;
        axios.get(`${config.baseURL}/api/activity-my-data/${this.props.match.params.communityId}`, {
            headers: {
                token: localStorage.getItem("UserToken")
            }
        })
            .then(res => {
                if (res.data.code === 200) {
                    localStorage.setItem("UserToken", JSON.stringify(res.data.token));
                    _this.props.SaveMyPosts(res.data.data.myPosts);
                    _this.props.SaveMyAccepts(res.data.data.myAccepts);
                }
            })
            .catch(ErrorController);
    }

    componentDidUpdate(prevProps, prevState, snapShot) {
        if (prevProps.match.params.communityId !== this.props.match.params.communityId) {
            this.getAllActivities();
        }
    }

    render() {
        enableBodyScroll(this.state.targetElements);
        const {classes} = this.props;
        const {tabValue} = this.state;
        return (
            <FusePageSimple
                classes={{
                    header: "min-h-160 h-160",
                    toolbar: "min-h-48 h-48",
                    rightSidebar: "w-288",
                    content: classes.content,
                }}
                header={
                    <MyActivityHeader/>
                }

                contentToolbar={
                    <Tabs
                        value={tabValue}
                        onChange={this.handleChangeTab}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="off"
                        className="w-full border-b-1 px-24"
                        classes={{root: classes.tabsRoot, indicator: classes.tabsIndicator}}>
                        <Tab
                            label="Posted"
                            classes={{root: classes.tabRoot, selected: classes.tabSelected}}
                        />
                        <Tab
                            label="Accepted"
                            classes={{root: classes.tabRoot, selected: classes.tabSelected}}
                        />
                    </Tabs>
                }
                content={
                    <div className="p-12" style={{marginTop: '20px'}}>
                        {tabValue === 0 && (
                            <TabPostedData/>)}
                        {tabValue === 1 && (
                            <TabAcceptedData/>)}
                    </div>
                }
            />
        );
    };
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        SaveMyPosts: Actions.SaveMyPosts,
        SaveMyAccepts: Actions.SaveMyAccepts,
    }, dispatch);
};


export default withReducer('MyActivityStates', reducer)(withStyles(styles, {withTheme: true})(
    withRouter(connect(null, mapDispatchToProps)(MyActivity))
));
