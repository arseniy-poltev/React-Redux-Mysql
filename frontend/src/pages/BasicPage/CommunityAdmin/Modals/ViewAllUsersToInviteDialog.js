import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import {Checkbox, Fab, Icon} from "@material-ui/core";
import config from "../../../../config";
import {AccountCircle} from "@material-ui/icons";
import ReactTable from "react-table";
import 'react-table/react-table.css';
import {bindActionCreators} from "redux";
import * as Actions from "../store/actions";
import {withRouter} from "react-router-dom";
import connect from "react-redux/es/connect/connect";
import axios from "axios";
import {ErrorController} from "../../../../containers/ErrorController";

const styles = {
    addButton: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        zIndex: 99
    },
    appBar: {
        position: 'relative',
    },
    flex: {
        flex: 1,
    }
};

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class ViewAllUsersToInviteDialog extends React.Component {
    state = {
        allUserData: [],
        selectedUserIds: [],
        open: false,
    };

    getAllUsersToInvite() {
        this.props.onLoading(true);
        axios.get(`${config.baseURL}/api/admin/allUsersToInvite/${this.props.communityId}`, {
            headers: {
                token: localStorage.getItem("UserToken")
            }
        }).then(response => {
            if (response.data.code === 200) {
                localStorage.setItem("UserToken", JSON.stringify(response.data.token));
                this.props.onLoading(false);
                this.setState({
                    allUserData: response.data.data.filter(user => user.id)
                });
            } else {
                this.props.onLoading(false, false, response.data.message);
            }
        }).catch(error => {
            this.props.onLoading(false, false, error.message);
            ErrorController(error)
        });
    }

    handleClickOpen = () => {
        this.setState({open: true});
        this.getAllUsersToInvite();
    };

    handleClose = () => {
        this.setState({open: false});
    };

    handleAddNewUsers = () => {
        this.props.onLoading(true);
        axios.post(`${config.baseURL}/api/admin/addNewUsers`, {
            communityId: this.props.communityId,
            userIds: this.state.selectedUserIds
        }, {
            headers: {
                token: localStorage.getItem("UserToken")
            }
        }).then(response => {
            if (response.data.code === 200) {
                this.props.onLoading(false, true, response.data.message);
                this.props.addNewUsers(this.state.allUserData.filter(user => this.state.selectedUserIds.includes(user.id)));
            } else {
                this.props.onLoading(false, false, response.data.message);
            }
            this.handleClose();
        }).catch(error => {
            this.props.onLoading(false, false, error.message);
            this.handleClose();
            ErrorController(error)
        });
    };

    toggleInSelectedUsers(contactId) {
        const {selectedUserIds} = this.state;
        if (selectedUserIds.find(id => id === contactId) !== undefined) {
            this.setState({
                selectedUserIds: selectedUserIds.filter(id => id !== contactId)
            })
        } else {
            this.setState({
                selectedUserIds: [...selectedUserIds, contactId]
            })
        }
    }

    selectAllUsers() {
        this.setState({
            selectedUserIds: this.state.allUserData.map(user => user.id)
        })
    }

    deSelectAllUsers() {
        this.setState({
            selectedUserIds: []
        })
    }

    render() {
        const {classes} = this.props;
        const {selectedUserIds, allUserData} = this.state;
        return (
            <div>
                <Fab
                    color="primary"
                    aria-label="add"
                    className={classes.addButton}
                    onClick={this.handleClickOpen}
                >
                    <Icon>person_add</Icon>
                </Fab>
                <Dialog
                    fullScreen
                    open={this.state.open}
                    onClose={this.handleClose}
                    TransitionComponent={Transition}
                >
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                                <CloseIcon/>
                            </IconButton>
                            <Typography variant="h6" color="inherit" className={classes.flex}>
                                Close
                            </Typography>
                            {
                                selectedUserIds.length > 0 &&
                                <Button
                                    color="inherit"
                                    onClick={this.handleAddNewUsers}>
                                    Add
                                </Button>
                            }
                        </Toolbar>
                    </AppBar>
                    {
                        allUserData && allUserData.length > 0
                            ? <ReactTable
                                resizable={false}
                                className="-striped -highlight md:border-1"
                                getTrProps={(state, rowInfo, column) => {
                                    return {
                                        className: "cursor-pointer",
                                        onClick: (e, handleOriginal) => {
                                            if (rowInfo) {
                                                this.toggleInSelectedUsers(rowInfo.original.id)
                                            }
                                        }
                                    }
                                }}
                                data={allUserData}
                                columns={[
                                    {
                                        Header: () => (
                                            <Checkbox
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                }}
                                                onChange={(event) => {
                                                    event.target.checked ? this.selectAllUsers() : this.deSelectAllUsers();
                                                }}
                                                checked={selectedUserIds.length === Object.keys(allUserData).length && selectedUserIds.length > 0}
                                                indeterminate={selectedUserIds.length !== Object.keys(allUserData).length && selectedUserIds.length > 0}
                                            />
                                        ),
                                        accessor: "",
                                        Cell: row => {
                                            return (<Checkbox
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                    }}
                                                    checked={selectedUserIds.includes(row.value.id)}
                                                    onChange={() => this.toggleInSelectedUsers(row.value.id)}
                                                />
                                            )
                                        },
                                        className: "justify-center",
                                        sortable: false,
                                        width: 64
                                    },
                                    {
                                        Header: () => null,
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
                                        className: "font-bold justify-center"
                                    },
                                    {
                                        Header: "Last Name",
                                        accessor: "lastName",
                                        filterable: true,
                                        className: "font-bold justify-center"
                                    },
                                    {
                                        Header: "Username",
                                        accessor: "userName",
                                        filterable: true,
                                        className: "justify-center",
                                    },
                                    {
                                        Header: "Email",
                                        accessor: "email",
                                        filterable: true,
                                        className: "justify-center",
                                    },
                                ]}
                                defaultPageSize={10}
                                noDataText="No user found"
                            />
                            : <div className="flex items-center justify-center h-full">
                                <Typography color="textSecondary" variant="h5">
                                    There is no User!
                                </Typography>
                            </div>
                    }
                </Dialog>
            </div>
        );
    }
}

ViewAllUsersToInviteDialog.propTypes = {
    classes: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNewUsers: Actions.addNewUsers,
    }, dispatch);
}

export default withRouter(connect(null, mapDispatchToProps)(withStyles(styles)(ViewAllUsersToInviteDialog)));