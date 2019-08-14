import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {
    AppBar,
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    Icon,
    List,
    ListItem,
    ListItemText,
    Paper,
    Toolbar,
    Typography,
} from '@material-ui/core';
import {People, ContactSupport} from '@material-ui/icons';
import {FuseAnimate} from '../../../@fuse';
import {NavLink, withRouter} from 'react-router-dom';
import IntegrationReactSelect from "../SuperAdmin/Modals/IntegrationReactSelect";
import axios from "axios";
import config from "../../../config";
import {ErrorController} from "../../../containers/ErrorController";
import {bindActionCreators} from "redux";
import * as Actions from "./store/actions";
import connect from "react-redux/es/connect/connect";

const styles = theme => ({
    listItem: {
        color: 'inherit!important',
        textDecoration: 'none!important',
        height: 40,
        width: 'calc(100% - 16px)',
        borderRadius: '0 20px 20px 0',
        paddingLeft: 24,
        paddingRight: 12,
        '&.active': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.secondary.contrastText + '!important',
            pointerEvents: 'none',
            '& .list-item-icon': {
                color: 'inherit'
            }
        },
    }
});

class CommunityAdminSidebarContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openInviteNewUserPage: false,
            usersToInvite: [],
            selectedNewUser: null,
            errorMessage: '',
            emailToInvite: ''
        };
        this.getAllUsers = this.getAllUsers.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleExistingUser = this.handleExistingUser.bind(this);
        this.openComposeDialog = this.openComposeDialog.bind(this);
        this.closeComposeDialog = this.closeComposeDialog.bind(this);
    }

    getAllUsers() {
        this.props.onLoading(true);
        axios.get(`${config.baseURL}/api/admin/allUsersToInvite/${this.props.match.params.communityId}`, {
            headers: {
                token: localStorage.getItem("UserToken")
            }
        }).then(response => {
            if (response.data.code === 200) {
                localStorage.setItem("UserToken", JSON.stringify(response.data.token));
                this.props.onLoading(false, true);
                this.setState({
                    usersToInvite: response.data.data
                })
            } else {
                this.props.onLoading(false, false, response.data.message);
            }
        }).catch(error => {
            this.props.onLoading(false, false, error.message);
            ErrorController(error)
        });
    }

    handleExistingUser = name => target => {
        this.setState({
            [name]: target, // selectedNewUser
            emailToInvite: '',
        });
    };

    handleEmailChange = name => value => {
        if (value) {
            this.setState({
                [name]: value, // emailToInvite
                selectedNewUser: null
            });
        }
    };
    inviteNewUser = () => {
        if (this.state.errorMessage) {
            return
        }
        if (this.state.emailToInvite !== '') {
            this.addNoExistingAccount(this.state.emailToInvite)
        } else {
            if (this.state.selectedNewUser) {
                this.addExistingAccount(this.state.selectedNewUser.value);
            } else {
                this.setState({
                    errorMessage: `Email address is invalid`
                })
            }
        }
    };
    addNoExistingAccount = (targetEmail) => {
        if (!this.validateEmail(targetEmail)) {
            this.setState({
                errorMessage: `Email address is invalid`
            });
            return
        }
        const isUserInThisCommunity = Object.values(this.props.users).find(userData => userData.email === targetEmail);
        if (isUserInThisCommunity) {
            this.setState({
                errorMessage: targetEmail ? `This user ${targetEmail} exists already in this community` : '',
            });
            return;
        }
        this.props.onLoading(true);
        axios.post(`${config.baseURL}/api/admin/inviteNewUser`, {
            communityId: Number(this.props.match.params.communityId),
            email: targetEmail
        }, {
            headers: {
                token: localStorage.getItem('UserToken')
            }
        }).then(response => {
            if (response.data.code === 200) {
                localStorage.setItem("UserToken", JSON.stringify(response.data.token));
                this.props.onLoading(false, true, response.data.message);
                this.closeComposeDialog();
            } else {
                this.props.onLoading(false, false, response.data.message);
            }
        }).catch(error => {
            this.props.onLoading(false, false, error.message);
            ErrorController(error)
        });
    };
    addExistingAccount = (target) => {
        this.props.onLoading(true);
        axios.post(`${config.baseURL}/api/admin/addNewUsers`, {
            communityId: this.props.match.params.communityId,
            userIds: [target.id]
        }, {
            headers: {
                token: localStorage.getItem("UserToken")
            }
        }).then(response => {
            if (response.data.code === 200) {
                this.props.onLoading(false, true, response.data.message);
                localStorage.setItem("UserToken", JSON.stringify(response.data.token));
                this.props.addNewUsers([target]);
                this.closeComposeDialog();
            } else {
                this.props.onLoading(false, false, response.data.message);
            }
        }).catch(error => {
            this.props.onLoading(false, false, error.message);
            ErrorController(error)
        });
    };
    validateEmail = email => email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
    openComposeDialog = () => {
        this.getAllUsers();
        this.setState({
            openInviteNewUserPage: true,
            selectedNewUser: null,
            errorMessage: '',
            emailToInvite: ''
        });
    };
    closeComposeDialog = () => {
        this.setState({
            openInviteNewUserPage: false,
        });
    };

    render() {
        const {classes, match} = this.props;
        const {openInviteNewUserPage, errorMessage} = this.state;
        const userInfo = localStorage.getItem("UserInfo")
            && localStorage.getItem("UserInfo") !== ''
            && JSON.parse(localStorage.getItem("UserInfo"));
        const displayName = userInfo ? (userInfo.firstName + ' ' + userInfo.lastName) : ' ';
        return (
            <div className="p-16 lg:p-24 lg:pr-4">
                <FuseAnimate animation="transition.slideLeftIn" delay={200}>
                    <Paper elevation={1} className="rounded-8">
                        <div className="p-24 flex items-center">
                            <Avatar className="mr-12" alt={displayName} src={require('../../../assets/Barrera.jpg')}/>
                            <Typography>{displayName}</Typography>
                        </div>
                        <Divider/>
                        <List>
                            <ListItem
                                button
                                component={NavLink}
                                to={'/admin/users/all/' + match.params.communityId}
                                activeClassName="active"
                                className={classes.listItem}
                            >
                                <People/>
                                <ListItemText
                                    className="truncate pr-0"
                                    primary="All Users"
                                    disableTypography={true}/>
                            </ListItem>
                            <ListItem
                                button
                                component={NavLink}
                                to={'/admin/users/proposed/' + match.params.communityId}
                                activeClassName="active"
                                className={classes.listItem}
                            >
                                <ContactSupport/>
                                <ListItemText
                                    className="truncate pr-0"
                                    primary="Proposed Users"
                                    disableTypography={true}/>
                            </ListItem>
                            <ListItem selected={false} style={{cursor: 'pointer'}}
                                      button
                                      onClick={() => this.openComposeDialog()}
                                      className={classes.listItem}
                            >
                                <Icon>how_to_reg</Icon>
                                <ListItemText
                                    className="truncate pr-0"
                                    primary="Invite new user"
                                    disableTypography={true}/>
                            </ListItem>
                        </List>
                    </Paper>
                </FuseAnimate>
                <Dialog
                    classes={{paper: "m-24"}}
                    open={openInviteNewUserPage}
                    onClose={this.closeComposeDialog}
                    fullWidth
                    maxWidth={"sm"}
                >
                    <AppBar position="static" elevation={1}>
                        <Toolbar className="flex w-full">
                            <Typography variant="subtitle1" color="inherit" style={{margin: '0.8rem'}}>
                                <div style={{fontSize: '2rem', color: '#b8e0dd'}}>
                                    <strong>Invite New User</strong>
                                </div>
                                <div style={{height: '30px', color: 'red'}}>{errorMessage}</div>
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <DialogContent classes={{root: "p-24"}}>
                        <Typography style={{marginTop: '20px'}} component="div" color="textSecondary">
                            <div className="row col-md-12" style={{margin: '0'}}>
                                <IntegrationReactSelect
                                    isForInvitingAsAdmin={false}
                                    suggestions={this.state.usersToInvite.map(user => ({
                                        value: user,
                                        label: user.email,
                                    }))}
                                    handleEmailChange={this.handleEmailChange}
                                    handleAddNewUser={this.handleExistingUser}
                                    value={this.state.selectedNewUser}
                                />
                            </div>
                        </Typography>
                    </DialogContent>
                    <DialogActions className="justify-between pl-16">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => this.closeComposeDialog()}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => this.inviteNewUser()}
                        >
                            Invite
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

function mapStateToProps({CommunityAdminStates}) {
    return {
        users: CommunityAdminStates.users.entities,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNewUsers: Actions.addNewUsers,
    }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, {withTheme: true})(CommunityAdminSidebarContent)));