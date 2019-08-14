import React, {Component} from 'react';
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
} from '@material-ui/core';
import {bindActionCreators} from 'redux';
import * as Actions from '../store/actions/index';
import {connect} from 'react-redux';
import _ from '../../../../@lodash/index';
import config from "../../../../config";
import {getDiffStr} from "../../../../containers/GlobalFunc";

const ACTIVITY_TYPE = config.activityType;
const ACTIVITY_TAG = config.activityTagType;
const ACTIVITY_STATUS = config.activityStatus;

const newContactState = {
    id: '',
    accepts: [],
    activityTag: 1,
    activityType: 1,
    amount: 0,
    attachments: "[]",
    comments: "[]",
    communityId: 1,
    description: "updates",
    email: "admin1@demo.com",
    endDate: "2019-04-15T21:49:22.000Z",
    firstName: "ADMIN",
    isEmergency: 0,
    lastName: "222",
    startDate: "2019-04-09T13:49:22.000Z",
    status: 1,
    title: "updates",
    userId: 4,
    userName: "admin1",
    avatar: 'assets/images/avatars/profile.jpg',
};

class ViewCardDetailDialog extends Component {

    state = {...newContactState};

    componentDidUpdate(prevProps, prevState, snapshot) {
        /**
         * After Dialog Open
         */
        if (!prevProps.contactDialog.props.open && this.props.contactDialog.props.open) {
            /**
             * Dialog type: 'edit'
             * Update State
             */
            if (this.props.contactDialog.data &&
                !_.isEqual(this.props.contactDialog.data, prevState)) {
                this.setState({...this.props.contactDialog.data});
            }
        }
    }

    closeComposeDialog = () => {
        this.props.closeCardDetailDialog()
    };

    render() {
        const {contactDialog} = this.props;

        return (
            <Dialog
                classes={{paper: "m-24"}}
                {...contactDialog.props}
                onClose={this.closeComposeDialog}
                fullWidth
                maxWidth="lg"
            >
                <AppBar position="static" elevation={1}>
                    <Toolbar className="flex w-full">
                        <Typography variant="subtitle1" color="inherit" style={{margin: '0.8rem'}}>
                            <div style={{fontSize: '2rem', color: '#b8e0dd'}}>
                                <strong>{this.state.title}</strong>
                            </div>
                            <div>
                                Posted By
                                &nbsp;&nbsp;
                                {this.state.firstName}
                                &nbsp;&nbsp;
                                {this.state.lastName}</div>
                            <div>Username:&nbsp;&nbsp;<strong>{this.state.userName}</strong></div>
                            <div>Email Address:&nbsp;&nbsp;<strong><a href={"mailto:"+this.state.email} type="email">{this.state.email}</a></strong></div>
                        </Typography>
                    </Toolbar>
                </AppBar>
                <DialogContent classes={{root: "p-24"}}>
                    <Card style={{marginTop: '20px'}}>
                        <CardContent>
                            <Typography color="textSecondary">
                                 <span style={{color: '#4285f4', margin: '20px', fontWeight: 'bold'}}>
                                    {
                                        this.state.activityType === ACTIVITY_TYPE.ASK
                                            ? `Asking for`
                                            : this.state.activityType === ACTIVITY_TYPE.OFFER
                                            ? `Offer`
                                            : this.state.activityType === ACTIVITY_TYPE.ANNOUNCE
                                                ? `Announcement`
                                                : this.state.activityType === ACTIVITY_TYPE.SHARED_STORIES
                                                    ? `Shared Story`
                                                    : null
                                    }
                                </span>
                                {
                                    this.state.activityTag === ACTIVITY_TAG.HIGH
                                        ? <span className="badge badge-danger">High Priority</span>
                                        : this.state.activityTag === ACTIVITY_TAG.MEDIUM
                                        ? <span className="badge badge-success">Medium Priority</span>
                                        : this.state.activityTag === ACTIVITY_TAG.LOW
                                            ? <span className="badge badge-primary">Low Priority</span>
                                            : null
                                }
                                {
                                    this.state.isEmergency ?
                                        <span style={{fontWeight: 'normal', fontSize: '10px', marginLeft: '20px'}}
                                              className="badge badge-info">Emergency</span> : null
                                }
                                {
                                    this.state.status === ACTIVITY_STATUS.ACTIVE
                                        ? <span
                                            style={{fontWeight: 'normal', fontSize: '10px', marginLeft: '20px'}}
                                            className="badge badge-primary">Active</span>
                                        : <span
                                            style={{fontWeight: 'normal', fontSize: '10px', marginLeft: '20px'}}
                                            className="badge badge-warning">Inactive</span>
                                }
                            </Typography>
                            <Typography component="div">
                                <div style={{margin: '2% 5%', width: '90%'}}>
                                    <div style={{marginBottom: '20px'}}>
                                        <span>{getDiffStr(new Date(this.state.startDate))}</span>
                                    </div>
                                    <hr/>
                                    <div
                                        style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                                        {this.state.description}
                                    </div>
                                    {
                                        this.state.activityType !== ACTIVITY_TYPE.SHARED_STORIES
                                            ? <div>
                                                <hr/>
                                                <span>
                                                    <strong>Expire Date:</strong>
                                                    &nbsp;&nbsp;
                                                    <span>{new Date(this.state.endDate).toLocaleDateString()}</span>
                                                </span>
                                                <span style={{marginLeft: '50px'}}>
                                                    <strong>Price:</strong>
                                                    &nbsp;&nbsp;
                                                    <span>{this.state.amount}</span>
                                                </span>
                                                {
                                                    this.state.activityType !== ACTIVITY_TYPE.ANNOUNCE
                                                        ? <span style={{marginLeft: '50px'}}>
                                                            <strong>Accepted:</strong>
                                                            &nbsp;&nbsp;
                                                            <span>{this.state.accepts.length}</span>
                                                        </span> : null
                                                }
                                            </div> : null
                                    }
                                    {
                                        JSON.parse(this.state.attachments).length > 0 ?
                                            <div>
                                                <hr/>
                                                <div
                                                    style={{
                                                        color: '#4285f4',
                                                        fontWeight: 'bold',
                                                        fontSize: '1em'
                                                    }}>Attachments({JSON.parse(this.state.attachments).length})
                                                </div>
                                                <br/>
                                                {
                                                    JSON.parse(this.state.attachments).length > 0
                                                        ? JSON.parse(this.state.attachments).map(attachment =>
                                                            <div key={attachment.attachmentId}>
                                                                <i className="fa fa-paperclip"
                                                                   style={{
                                                                       color: 'blue',
                                                                       fontSize: '120%',
                                                                   }}
                                                                   aria-hidden="true"/>&nbsp;&nbsp;
                                                                <a
                                                                    rel="noopener noreferrer"
                                                                    href={attachment.attachmentName} download target="_blank"
                                                                   style={{color: '#000'}}>
                                                                    {attachment.originalFileName}
                                                                </a>
                                                            </div>) : null
                                                }
                                            </div> : null
                                    }
                                </div>
                                <hr style={{width: '100%'}}/>
                                {
                                    JSON.parse(this.state.comments).length > 0
                                    && <div style={{margin: '0 5% 5%', width: '90%'}}>
                                        <div style={{
                                            color: '#4285f4',
                                            fontWeight: 'bold',
                                            fontSize: '1em'
                                        }}>Comments
                                        </div>
                                        <br/>
                                        {
                                            JSON.parse(this.state.comments).map((comment, index) =>
                                                <div key={index} style={{margin: '10px 0'}}>
                                                    <i className='fas fa-user-circle' style={{
                                                        color: '#857e87',
                                                        fontSize: '120%',
                                                        fontWeight: 'bold'
                                                    }}/>
                                                    <span style={{marginLeft: '10px', color: '#000'}}
                                                          className="user">{comment.userName}</span><br/>
                                                    <div style={{marginTop: '10px', color: '#727272'}}
                                                         className="comment">{comment.comment}</div>
                                                </div>
                                            )
                                        }
                                    </div>
                                }
                            </Typography>
                        </CardContent>
                    </Card>
                </DialogContent>
                <DialogActions className="justify-between pl-16">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => this.closeComposeDialog()}
                    >
                        Close
                    </Button>
                    <IconButton
                        onClick={() => {
                            this.closeComposeDialog();
                            this.props.removeCards([this.state.id]);
                        }}
                    >
                        <Icon>delete</Icon>
                    </IconButton>
                </DialogActions>
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeCardDetailDialog: Actions.closeCardDetailDialog,
        removeUsers: Actions.removeUsers
    }, dispatch);
}

function mapStateToProps({CommunityAdminStates}) {
    return {
        contactDialog: CommunityAdminStates.activities.contactDialog
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewCardDetailDialog);
