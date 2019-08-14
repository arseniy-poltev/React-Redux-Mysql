import React, {Component} from 'react';
import {
    Checkbox,
    Icon,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    Typography
} from '@material-ui/core';
import {FuseUtils, FuseAnimate} from '../../../@fuse';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import ReactTable from "react-table";
import * as Actions from './store/actions';
import 'react-table/react-table.css';
import {AccountCircle, VerifiedUser} from "@material-ui/icons";
import config from "../../../config";
import Button from "@material-ui/core/Button/Button";
import axios from "axios";
import {ErrorController} from "../../../containers/ErrorController";
import AlertDialog from "../../ExternalPages/AlertDialog";

class CommunityAdminUserList extends Component {
    state = {
        selectedContactsMenu: null,
        isOpen: false,
        title: '',
        description: '',
        action: null,
    };

    getFilteredArray = (entities, searchText) => {
        const arr = Object.keys(entities).map((id) => entities[id]);
        if (searchText.length === 0) {
            return arr;
        }
        return FuseUtils.filterArrayByString(arr, searchText);
    };

    openSelectedContactMenu = (event) => {
        this.setState({selectedContactsMenu: event.currentTarget});
    };

    closeSelectedContactsMenu = () => {
        this.setState({selectedContactsMenu: null});
    };

    approveRequestToJoin(userIds) {
        this.props.onLoading(true);
        axios.post(`${config.baseURL}/api/admin/approveUsers`, {
            communityId: this.props.match.params.communityId,
            userIds
        }, {
            headers: {
                token: localStorage.getItem("UserToken")
            }
        }).then(response => {
            this.closeSelectedContactsMenu();
            if (response.data.code === 200) {
                this.props.approveRequestToJoin(userIds);
                this.props.onLoading(false, true, response.data.message);
            } else {
                this.props.onLoading(false, false, response.data.message);
            }
        }).catch(error => {
            this.props.onLoading(false, false, error.message);
            ErrorController(error)
        });
    }
    handleClose = (isOpen, isAgree, action) => {
        this.setState({isOpen});
        if (isAgree === true) {
            switch (action.type) {
                case 'RemoveUsers':
                    this.removeUsers(action.data);
                    break;
                case 'RemoveAdmin':
                    this.removeAdmin(action.data.id, action.data.adminId);
                    break;
                default:
                    return null
            }
        }
    };
    removeUsers(userIds) {
        this.props.onLoading(true);
        axios.post(`${config.baseURL}/api/admin/removeUsers`, {
            communityId: this.props.match.params.communityId,
            userIds
        }, {
            headers: {
                token: localStorage.getItem("UserToken")
            }
        }).then(response => {
            this.closeSelectedContactsMenu();
            if (response.data.code === 200) {
                this.props.removeUsers(userIds);
                this.props.onLoading(false, true, response.data.message);
            } else {
                this.props.onLoading(false, false, response.data.message);
            }
        }).catch(error => {
            this.props.onLoading(false, false, error.message);
            ErrorController(error)
        });
    }

    render() {
        const {
            users,
            searchText,
            selectedContactIds,
            selectAllContacts,
            deSelectAllContacts,
            toggleInSelectedContacts,
        } = this.props;
        const allUsers = this.getFilteredArray(users, searchText);
        const {selectedContactsMenu} = this.state;

        const data = this.props.match.params.usersType === 'proposed'
            ? allUsers.filter(user => user.status === config.userJoinStatus.REQUEST_JOIN)
            : this.props.match.params.usersType === 'all' && allUsers;

        if (!data || data.length === 0) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Typography color="textSecondary" variant="h5">
                        There is no User!
                    </Typography>
                </div>
            );
        }
        const usersToApprove = selectedContactIds.filter(
            userId => allUsers.find(
                user => user.id === userId
            ).status === config.userJoinStatus.REQUEST_JOIN
        );
        return (
            <div ref="reactTable">
                <FuseAnimate animation="transition.slideUpIn" delay={300}>
                    <ReactTable
                        resizable={false}
                        className="-striped -highlight border-0"
                        getTrProps={(state, rowInfo, column) => {
                            return {
                                className: "cursor-pointer",
                                onClick: (e, handleOriginal) => {
                                    if (rowInfo) {
                                        toggleInSelectedContacts(rowInfo.original.id)
                                    }
                                }
                            }
                        }}
                        data={data}
                        columns={[
                            {
                                Header: () => (
                                    <Checkbox
                                        onClick={(event) => {
                                            event.stopPropagation();
                                        }}
                                        onChange={(event) => {
                                            event.target.checked ? selectAllContacts() : deSelectAllContacts();
                                        }}
                                        checked={selectedContactIds.length === Object.keys(users).length && selectedContactIds.length > 0}
                                        indeterminate={selectedContactIds.length !== Object.keys(users).length && selectedContactIds.length > 0}
                                    />
                                ),
                                accessor: "",
                                Cell: row => {
                                    return (<Checkbox
                                            onClick={(event) => {
                                                event.stopPropagation();
                                            }}
                                            checked={selectedContactIds.includes(row.value.id)}
                                            onChange={() => toggleInSelectedContacts(row.value.id)}
                                        />
                                    )
                                },
                                className: "justify-center",
                                sortable: false,
                                width: 64
                            },
                            {
                                Header: () => (
                                    selectedContactIds.length > 0 && (
                                        <React.Fragment>
                                            <IconButton
                                                aria-owns={selectedContactsMenu ? 'selectedContactsMenu' : null}
                                                aria-haspopup="true"
                                                onClick={this.openSelectedContactMenu}>
                                                <Icon>more_horiz</Icon>
                                            </IconButton>
                                            <Menu
                                                id="selectedContactsMenu"
                                                anchorEl={selectedContactsMenu}
                                                open={Boolean(selectedContactsMenu)}
                                                onClose={this.closeSelectedContactsMenu}
                                            >
                                                <MenuList>
                                                    <MenuItem
                                                        onClick={() =>
                                                            usersToApprove.length > 0
                                                                ? this.approveRequestToJoin(usersToApprove)
                                                                : null}
                                                    >
                                                        <ListItemIcon>
                                                            <VerifiedUser/>
                                                        </ListItemIcon>
                                                        <ListItemText inset primary="Approve"/>
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => {
                                                            this.setState({
                                                                isOpen: true,
                                                                title: 'These Selected Users Will Be Removed',
                                                                description: 'Are you sure you want to continue your operation?',
                                                                action: {
                                                                    type: 'RemoveUsers',
                                                                    data: selectedContactIds
                                                                }
                                                            });
                                                            this.closeSelectedContactsMenu();
                                                        }}
                                                    >
                                                        <ListItemIcon>
                                                            <Icon>delete</Icon>
                                                        </ListItemIcon>
                                                        <ListItemText inset primary="Remove"/>
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </React.Fragment>
                                    )
                                ),
                                accessor: "avatar",
                                Cell: row => (
                                    <AccountCircle/>
                                ),
                                className: "justify-center",
                                width: 64,
                                sortable: false
                            },
                            {
                                Header: "First Name",
                                accessor: "firstName",
                                filterable: true,
                                className: "font-bold"
                            },
                            {
                                Header: "Last Name",
                                accessor: "lastName",
                                filterable: true,
                                className: "font-bold"
                            },
                            {
                                Header: "Username",
                                accessor: "userName",
                                filterable: true
                            },
                            {
                                Header: "Email",
                                accessor: "email",
                                filterable: true,
                                width: 200,
                            },
                            {
                                Header: "",
                                width: 200,
                                Cell: row => (
                                    row.original.status && row.original.status === 1 ? (
                                        <div className="flex items-center" style={{width: '100%'}}>
                                            <Button
                                                color="secondary"
                                                variant="contained"
                                                style={{width: '50%'}}
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    this.approveRequestToJoin([row.original.id])
                                                }
                                                }
                                                size="small">Approve</Button>
                                            <Button
                                                color="primary"
                                                variant="contained"
                                                style={{width: '50%', float: 'right'}}
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    this.setState({
                                                        isOpen: true,
                                                        title: 'This User Will Be Removed',
                                                        description: 'Are you sure you want to continue your operation?',
                                                        action: {
                                                            type: 'RemoveUsers',
                                                            data: [row.original.id]
                                                        }
                                                    });
                                                }}
                                                size="small">Refuse</Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center" style={{width: '100%'}}>
                                            <div style={{width: '50%', textAlign: 'center'}}>
                                                <VerifiedUser color="primary"/>
                                            </div>
                                            <Button
                                                color="primary"
                                                variant="contained"
                                                style={{width: '50%', float: 'right'}}
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    this.setState({
                                                        isOpen: true,
                                                        title: 'This User Will Be Removed',
                                                        description: 'Are you sure you want to continue your operation?',
                                                        action: {
                                                            type: 'RemoveUsers',
                                                            data: [row.original.id]
                                                        }
                                                    });
                                                }}
                                                size="small">Remove</Button>
                                        </div>
                                    )
                                )
                            }
                        ]}
                        defaultPageSize={10}
                        noDataText="No user found"
                    />
                </FuseAnimate>
                <AlertDialog
                    open={this.state.isOpen}
                    title={this.state.title}
                    description={this.state.description}
                    handleClose={this.handleClose}
                    action={this.state.action}/>
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        toggleInSelectedContacts: Actions.toggleInSelectedContacts,
        selectAllContacts: Actions.selectAllContacts,
        deSelectAllContacts: Actions.deSelectAllContacts,
        removeUsers: Actions.removeUsers,
        approveRequestToJoin: Actions.approveRequestToJoin,
    }, dispatch);
}

function mapStateToProps({CommunityAdminStates}) {
    return {
        users: CommunityAdminStates.users.entities,
        selectedContactIds: CommunityAdminStates.users.selectedContactIds,
        searchText: CommunityAdminStates.users.searchText,
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CommunityAdminUserList));
