import React, {Component} from 'react';
import cn from 'classnames';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Icon,
    IconButton,
    Typography,
    Toolbar,
    AppBar,
    Card,
    CardContent,
    withStyles,
    Fab,
    TextField,
} from '@material-ui/core';
import {bindActionCreators} from 'redux';
import * as Actions from '../store/actions/index';
import {connect} from 'react-redux';
import _ from '../../../../@lodash/index';
import axios from "axios";
import {ErrorController} from "../../../../containers/ErrorController";
import config from "../../../../config";
import AlertDialog from "../../../ExternalPages/AlertDialog";
import IntegrationReactSelect from "./IntegrationReactSelect";

const newContactState = {
    id: 0,
    name: '',
    admins: [],
    numUsers: 0,
    numPosts: 0,
    numActivePosts: 0,

    usersToInviteAsAdmin: [],
    isOpen: false,
    title: '',
    description: '',
    action: null,
    selectedNewAdmin: null
};
const styles = {
    portion: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)'
    },
    addButton: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        zIndex: 99
    },
};

class ViewCommunityDetailDialog extends Component {

    state = {...newContactState};

    componentDidUpdate(prevProps, prevState, snapshot) {
        /**
         * After Dialog Open
         */
        if (!prevProps.detailViewDialog.props.open && this.props.detailViewDialog.props.open) {
            /**
             * Dialog type: 'edit'
             * Update State
             */
            this.props.onLoadingHandler(true);
            if (this.props.detailViewDialog.data &&
                !_.isEqual(this.props.detailViewDialog.data, prevState)) {
                if (this.props.detailViewDialog.type === 'edit') {
                    this.setState({...this.props.detailViewDialog.data});
                }
            } else {
                this.setState({...newContactState});
            }
            axios.get(`${config.baseURL}/api/super/users`, {
                headers: {
                    token: localStorage.getItem('UserToken')
                }
            }).then(response => {
                if (response.data.code === 200) {
                    localStorage.setItem("UserToken", JSON.stringify(response.data.token));
                    this.props.onLoadingHandler(false, true);
                    this.setState({
                        usersToInviteAsAdmin: response.data.data
                    })
                } else {
                    this.props.onLoadingHandler(false, false, response.data.message);
                }
            }).catch(error => {
                this.props.onLoadingHandler(false, false, error.message);
                ErrorController(error)
            });
        }
    }

    handleClickOpen = () => {
        this.props.openAddNewCommunityDialog()
    };

    closeComposeDialog = () => {
        this.props.closeCommunityDetailDialog()
    };

    handleClose = (isOpen, isAgree, action) => {
        this.setState({isOpen});
        if (isAgree === true) {
            switch (action.type) {
                case 'RemoveCommunity':
                    this.removeCommunities(action.data);
                    break;
                case 'RemoveAdmin':
                    this.removeAdmin(action.data.id, action.data.adminId);
                    break;
                default:
                    return null
            }
        }
    };

    addNewCommunity() {
        if (this.state.name.trim() !== '') {
            this.props.onLoadingHandler(true);
            axios.post(`${config.baseURL}/api/super/community-add`, {
                name: this.state.name
            }, {
                headers: {
                    token: localStorage.getItem('UserToken')
                }
            }).then(response => {
                if (response.data.code === 200) {
                    this.props.onLoadingHandler(false, true);
                    this.setState({...response.data.data});
                    this.props.openCommunityDetailDialog(response.data.data);
                    this.props.addNewCommunity(response.data.data);
                    const userInfo = JSON.parse(localStorage.getItem('UserInfo'));
                    userInfo.communities.push({
                        id: response.data.data.id,
                        name: response.data.data.name,
                        role: response.data.data.role
                    });
                    localStorage.setItem('UserInfo', JSON.stringify(userInfo));
                } else {
                    this.props.onLoadingHandler(false, false, response.data.message);
                }
            }).catch(error => {
                this.props.onLoadingHandler(false, false, error.message);
                ErrorController(error)
            });
        }
    }

    removeCommunities(communityIds) {
        this.props.removeCommunities(communityIds);
        this.closeComposeDialog();
    }

    addAdmin(adminInfo) {
        this.props.onLoadingHandler(true);
        axios.post(`${config.baseURL}/api/super/admin-add`, {
            communityId: this.state.id,
            adminId: adminInfo.id
        }, {
            headers: {
                token: localStorage.getItem('UserToken')
            }
        }).then(response => {
            if (response.data.code === 200) {
                this.props.onLoadingHandler(false, true);
                this.state.admins.push(adminInfo);
                this.setState({
                    ...this.state,
                    selectedNewAdmin: null
                }, () => {
                    this.props.openCommunityDetailDialog(this.state);
                })
            } else {
                this.props.onLoadingHandler(false, false, response.data.message);
                console.error("Error: ")
            }
        }).catch(error => {
            this.props.onLoadingHandler(false, false, error.message);
            ErrorController(error)
        });
    }

    removeAdmin(communityId, adminId) {
        this.props.onLoadingHandler(true);
        axios.post(`${config.baseURL}/api/super/admin-remove`, {
            communityId, adminId
        }, {
            headers: {
                token: localStorage.getItem('UserToken')
            }
        }).then(response => {
            if (response.data.code === 200) {
                this.props.onLoadingHandler(false, true);
                this.props.removeAdmin(communityId, adminId)
            } else {
                this.props.onLoadingHandler(false, false, response.data.message);
            }
        }).catch(error => {
            this.props.onLoadingHandler(false, false, error.message);
            ErrorController(error)
        });
    }

    handleChangeCommunityName = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    handleAddNewAdmin = name => target => {
        this.setState({
            [name]: target,
        });
        if (target) {
            this.addAdmin(target.value);
        }
    };

    render() {
        const {classes, detailViewDialog} = this.props;
        const {id, name, numUsers, admins, numPosts, numActivePosts} = this.state;
        const myId = JSON.parse(localStorage.getItem("UserInfo")).id;
        return (
            <div>
                <Fab
                    color="primary"
                    aria-label="add"
                    className={classes.addButton}
                    onClick={this.handleClickOpen}
                >
                    <Icon>group_work</Icon>
                </Fab>
                <Dialog
                    classes={{paper: "m-24"}}
                    {...detailViewDialog.props}
                    onClose={this.closeComposeDialog}
                    fullWidth
                    maxWidth={detailViewDialog.type === 'new' ? 'sm' : "md"}
                >
                    <AppBar position="static" elevation={1}>
                        <Toolbar className="flex w-full">
                            {
                                detailViewDialog.type === 'new'
                                    ? <Typography variant="subtitle1" color="inherit" style={{margin: '0.8rem'}}>
                                        <div style={{fontSize: '2rem', color: '#b8e0dd'}}>
                                            <strong>Create New Community</strong>
                                        </div>
                                    </Typography>
                                    : <Typography variant="subtitle1" color="inherit" style={{margin: '0.8rem'}}>
                                        <div style={{fontSize: '2rem', color: '#b8e0dd'}}>
                                            <strong>Detail Information of&nbsp;&nbsp;{name}</strong>
                                        </div>
                                        <div>Users:&nbsp;&nbsp;<strong>{numUsers}</strong></div>
                                        <div>Whole Posts:&nbsp;&nbsp;<strong>{numPosts}</strong></div>
                                        <div>Active Posts:&nbsp;&nbsp;<strong>{numActivePosts}</strong></div>
                                    </Typography>
                            }
                        </Toolbar>
                    </AppBar>
                    {
                        detailViewDialog.type === 'new'
                            ? <DialogContent classes={{root: "p-24"}}>
                                <Card style={{marginTop: '20px'}}>
                                    <CardContent>
                                        <Typography component="div" color="textSecondary">
                                            <div className="row col-md-12" style={{margin: '0'}}>
                                                <div className="col-md-9">
                                                    <TextField
                                                        fullWidth={true}
                                                        label="Community Name"
                                                        value={this.state.name}
                                                        onChange={this.handleChangeCommunityName('name')}
                                                        margin="normal"
                                                        variant="outlined"/>
                                                </div>
                                                <div className="justify-between col-md-3" style={{
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <Button
                                                        fullWidth={true}
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => this.addNewCommunity()}
                                                    >
                                                        Create
                                                    </Button>
                                                </div>
                                            </div>
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </DialogContent>
                            : <DialogContent classes={{root: "p-24"}}>
                                <Typography variant="subtitle1" color="inherit" style={{margin: '0.8rem'}}>
                                    <strong>Administrators</strong>
                                </Typography>
                                <Card style={{marginTop: '20px'}}>
                                    <CardContent>
                                        <Typography component="div" color="textSecondary">
                                            <div className="row col-md-12" style={{margin: '0'}}>
                                                <div className="col-md-3">
                                                    <span className={cn(classes.portion)}><strong>FirstName</strong></span>
                                                </div>
                                                <div className="col-md-3">
                                                    <span className={cn(classes.portion)}><strong>LastName</strong></span>
                                                </div>
                                                <div className="col-md-2">
                                                    <span className={cn(classes.portion)}><strong>UserName</strong></span>
                                                </div>
                                                <div className="col-md-3">
                                                    <span className={cn(classes.portion)}><strong>Email</strong></span>
                                                </div>
                                            </div>
                                            <hr/>
                                            {
                                                admins.length > 0 && admins.map(adminInfo =>
                                                    <div key={adminInfo.id} className="row col-md-12" style={{margin: '0'}}>
                                                        <div className="col-md-3">
                                                            <span
                                                                className={cn(classes.portion)}>{adminInfo.firstName}</span>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <span
                                                                className={cn(classes.portion)}>{adminInfo.lastName}</span>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <span
                                                                className={cn(classes.portion)}>{adminInfo.userName}</span>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <span className={cn(classes.portion)}>{adminInfo.email}</span>
                                                        </div>
                                                        <div className="col-md-1">
                                                            <IconButton
                                                                onClick={() => {
                                                                    this.setState({
                                                                        isOpen: true,
                                                                        title: 'This Admin Will Be Removed From This Community',
                                                                        description: 'Are you sure you want to continue your operation?',
                                                                        action: {
                                                                            type: 'RemoveAdmin',
                                                                            data: {id, adminId: adminInfo.id}
                                                                        }
                                                                    });
                                                                }}
                                                            >
                                                                <Icon>delete</Icon>
                                                            </IconButton>
                                                        </div>
                                                    </div>)
                                            }
                                            <hr/>
                                            <div className="row col-md-12" style={{margin: '0'}}>
                                                <IntegrationReactSelect
                                                    isForInvitingAsAdmin={true}
                                                    suggestions={this.state.usersToInviteAsAdmin.filter(
                                                        user =>
                                                            !this.state.admins.find(originalAdmin => originalAdmin.id === user.id)
                                                            && user.id !== myId
                                                    ).map(user => ({
                                                        value: user,
                                                        label: user.email,
                                                    }))}
                                                    handleAddNewAdmin={this.handleAddNewAdmin}
                                                    value={this.state.selectedNewAdmin}
                                                />
                                            </div>
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </DialogContent>
                    }
                    <DialogActions className="justify-between pl-16">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => this.closeComposeDialog()}
                        >
                            Close
                        </Button>
                        {
                            detailViewDialog.type === 'edit'
                            && <IconButton
                                onClick={() => {
                                    this.setState({
                                        isOpen: true,
                                        title: 'This Community Will Be Removed',
                                        description: 'Are you sure you want to continue your operation?',
                                        action: {
                                            type: 'RemoveCommunity',
                                            data: [id]
                                        }
                                    });
                                }}
                            >
                                <Icon>delete</Icon>
                            </IconButton>
                        }
                    </DialogActions>
                </Dialog>
                <AlertDialog
                    open={this.state.isOpen}
                    title={this.state.title}
                    description={this.state.description}
                    handleClose={this.handleClose}
                    action={this.state.action}
                />
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeCommunityDetailDialog: Actions.closeCommunityDetailDialog,
        openCommunityDetailDialog: Actions.openCommunityDetailDialog,
        openAddNewCommunityDialog: Actions.openAddNewCommunityDialog,
        addNewCommunity: Actions.addNewCommunity,
        removeAdmin: Actions.removeAdmin,
    }, dispatch);
}

function mapStateToProps({SuperAdminStates}) {
    return {
        detailViewDialog: SuperAdminStates.communities.detailViewDialog,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ViewCommunityDetailDialog));
