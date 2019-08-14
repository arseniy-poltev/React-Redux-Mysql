import React from 'react';
import {Card, CardContent} from "@material-ui/core";
import config from '../../../../config';
import axios from 'axios';
import {NotificationManager} from "react-notifications";
import LoadingScreen from "../../../../containers/Loading/LoadingScreen";
import {bindActionCreators} from "redux";
import * as Actions from '../store/actions/index'
import {withRouter} from "react-router-dom";
import connect from "react-redux/es/connect/connect";

class EditActivityDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            loadingValue: 0,
            editable: false,
            duration: 0,
            // posted data
            title: this.props.cardDetail.title,
            description: this.props.cardDetail.description,
            endDate: new Date(this.props.cardDetail.endDate).toLocaleDateString(),
            amount: this.props.cardDetail.amount,
            status: this.props.cardDetail.status,
            attachments: null
        };
        this.onEditHandler = this.onEditHandler.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.fileSelectorHandler = this.fileSelectorHandler.bind(this);
    }

    onEditHandler() {
        if (!this.state.editable) {
            this.setState({
                editable: !this.state.editable
            });
            return;
        }
        const postData = new FormData();
        postData.append("title", this.state.title);
        postData.append("description", this.state.description);
        postData.append("duration", this.state.duration);
        postData.append("amount", this.state.amount);
        postData.append("status", this.state.status);
        this.state.attachments
        && postData.append("attachments", this.state.attachments);
        const _this = this;
        axios.put(`${config.baseURL}/api/activity-update/${this.props.cardDetail.id}`, postData, {
            headers: {
                token: localStorage.getItem("UserToken"),
                'content-type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
                const completedPercentage = Math.round(progressEvent.loaded / progressEvent.total * 100);
                _this.setState({
                    isLoading: true,
                    loadingValue: completedPercentage
                }, () => {
                    if (completedPercentage >= 100) {
                        _this.setState({
                            isLoading: false,
                            loadingValue: 0
                        });
                    }
                });
            }
        }).then(res => {
            _this.setState({
                isLoading: false
            }, () => {
                if (res.data.code === 200) {
                    localStorage.setItem("UserToken", JSON.stringify(res.data.token));
                    _this.props.UpdateMyActivityDetail(res.data.data);
                    NotificationManager.success(`Updated Successfully`);
                    this.setState({
                        editable: !this.state.editable
                    });
                } else {
                    NotificationManager.error(res.data.message);
                }
            });
        }).catch(error => {
            console.error(error);
            _this.setState({
                isLoading: false
            }, () => {
                NotificationManager.error(error.message);
            });
        })
    }

    onChangeHandler(e) {
        switch (e.target.name) {
            case 'edtTitle':
                this.setState({
                    title: e.target.value
                });
                break;
            case 'edtDescription':
                this.setState({
                    description: e.target.value
                });
                break;
            case 'edtDuration':
                !isNaN(Number(e.target.value))
                && this.setState({
                    duration: Number(e.target.value)
                }, () => {
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + this.state.duration);
                    this.setState({
                        endDate: new Date(endDate).toLocaleDateString()
                    })
                });
                break;
            case 'edtAmount':
                !isNaN(Number(e.target.value))
                && this.setState({
                    amount: Number(e.target.value)
                });
                break;
            default:
                return;
        }
    }

    fileSelectorHandler(e) {
        this.setState({
            attachments: e.target.files[0]
        })
    }

    render() {
        let attachComp;
        if (this.state.editable && !this.props.attachments.length) {
            attachComp = <div>
                <hr/>
                <div
                    style={{
                        color: '#4285f4',
                        fontWeight: 'bold',
                        fontSize: '1em'
                    }}>Attachments({this.state.attachments ? `1` : `0`})
                </div>
                <br/>
                <div>
                    <span
                        style={{cursor: 'pointer'}}
                        onClick={() => this.fileInput.click()
                        }>
                        <i className="fa fa-paperclip" style={{color: 'blue'}}/>&nbsp;&nbsp;
                        {this.state.attachments ? <u>File Selected</u> : <u>Attach File</u>}
                    </span>
                    {
                        this.state.attachments ?
                            <div className="row col-md-4" style={{
                                textAlign: 'center',
                                color: '#73b2f8',
                            }}>
                                <span
                                    style={{wordBreak: 'break-all'}}
                                    className="col-md-10">{this.state.attachments.name}</span>
                                <span
                                    style={{
                                        color: '#73b2f8',
                                        margin: '0',
                                        fontSize: '20px'
                                    }}
                                    className="close col-md-2"
                                    onClick={() => this.setState({
                                        attachments: null
                                    })}>&times;</span>
                            </div> :
                            <span style={{height: '20px'}}>&nbsp;</span>
                    }
                    <input
                        type="file"
                        onChange={this.fileSelectorHandler}
                        style={{display: 'none'}}
                        ref={c => this.fileInput = c}/>
                </div>
            </div>
        }
        return (
            <div style={{position: 'relative'}}>
                <Card>
                    <CardContent>
                        <div className="row col-md-12" style={{margin: '0'}}>
                            <div className="detailTitle col-md-10">
                                {
                                    this.state.editable
                                        ? <input
                                            style={{
                                                color: '#3e4045',
                                                fontSize: '1em',
                                                fontWeight: 'bold'
                                            }}
                                            name="edtTitle"
                                            onChange={(e) => this.onChangeHandler(e)}
                                            className="form-control form-inline nofocus"
                                            value={this.state.title}/>
                                        : <span style={{
                                            whiteSpace: "normal",
                                            wordWrap: "break-word"
                                        }}>{this.state.title}</span>
                                }
                                {
                                    this.props.cardDetail.activityTag === config.activityTagType.HIGH
                                        ? <span style={{fontWeight: 'normal', fontSize: '10px', marginLeft: '20px'}}
                                                className="badge badge-danger">High Priority</span>
                                        : this.props.cardDetail.activityTag === config.activityTagType.MEDIUM
                                        ? <span
                                            style={{fontWeight: 'normal', fontSize: '10px', marginLeft: '20px'}}
                                            className="badge badge-success">Medium Priority</span>
                                        : this.props.cardDetail.activityTag === config.activityTagType.LOW
                                            ? <span
                                                style={{fontWeight: 'normal', fontSize: '10px', marginLeft: '20px'}}
                                                className="badge badge-primary">Low Priority</span>
                                            : null
                                }
                                {
                                    this.props.cardDetail.isEmergency ?
                                        <span style={{fontWeight: 'normal', fontSize: '10px', marginLeft: '20px'}}
                                              className="badge badge-info">Emergency</span> : null
                                }
                                {
                                    this.state.editable
                                    && <div
                                        style={{marginLeft: '20px'}}
                                        className="custom-control custom-checkbox custom-control-inline">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="chbEmergency"
                                            checked={this.state.status}
                                            onChange={() => this.setState({status: !this.state.status})}
                                        />
                                        <label
                                            style={{color: 'green'}}
                                            className="custom-control-label"
                                            htmlFor="chbEmergency">{this.state.status ? `Active` : 'Inactive'}</label>
                                    </div>
                                }
                            </div>
                            <div className="detailTitle col-md-2">
                                <button
                                    className="btn btn-primary"
                                    style={{color: 'white'}}
                                    onClick={this.onEditHandler}>
                                    {
                                        this.state.editable
                                            ? `Save` : `Edit`
                                    }
                                </button>
                            </div>
                        </div>
                        <hr style={{width: '100%'}}/>
                        <div style={{margin: '0 5% 2%', width: '90%'}}>
                            <div style={{
                                color: '#4285f4',
                                margin: '20px 0',
                                fontWeight: 'bold'
                            }}>
                                {
                                    this.props.cardDetail.activityType === config.activityType.ASK
                                        ? `Asking for`
                                        : this.props.cardDetail.activityType === config.activityType.OFFER
                                        ? `Offer`
                                        : this.props.cardDetail.activityType === config.activityType.ANNOUNCE
                                            ? `Announcement`
                                            : this.props.cardDetail.activityType === config.activityType.SHARED_STORIES
                                                ? `Shared Story`
                                                : null
                                }
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <span>{this.props.diffStartDateTime}</span>
                            </div>
                            <hr/>
                            {
                                this.state.editable
                                    ? <textarea
                                        className="form-control nofocus"
                                        name="edtDescription"
                                        onChange={this.onChangeHandler}
                                        style={{
                                            width: '100%',
                                            minHeight: '200px',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all'
                                        }}
                                        value={this.state.description}
                                    />
                                    : <div
                                        style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                                        {this.state.description}
                                    </div>
                            }
                            {
                                this.props.cardDetail.activityType !== config.activityType.SHARED_STORIES
                                    ? <div>
                                        <hr/>
                                        <span>
                                        <strong>Expire Date:</strong>&nbsp;&nbsp;
                                            {
                                                this.state.editable
                                                    ? <span>
                                                    (in&nbsp;&nbsp;
                                                        <input
                                                            style={{display: 'inline', width: '50px'}}
                                                            className="form-control form-inline nofocus"
                                                            value={this.state.duration}
                                                            name="edtDuration"
                                                            onChange={this.onChangeHandler}
                                                        />&nbsp;&nbsp;days)&nbsp;&nbsp;
                                                        {new Date(this.state.endDate).toLocaleDateString()}
                                                </span>
                                                    : <span>{new Date(this.state.endDate).toLocaleDateString()}</span>
                                            }
                                    </span>
                                        <span style={{marginLeft: '50px'}}>
                                        <strong>Price:</strong>&nbsp;&nbsp;
                                            {
                                                this.state.editable
                                                    ? <input
                                                        style={{display: 'inline', width: '50px'}}
                                                        className="form-control form-inline nofocus"
                                                        name="edtAmount"
                                                        onChange={this.onChangeHandler}
                                                        value={this.state.amount}
                                                    />
                                                    : <span>{this.state.amount}</span>
                                            }
                                    </span>
                                        {
                                            this.props.cardDetail.activityType !== config.activityType.ANNOUNCE
                                                ? (this.props.cardDetail.accepts.length > 0
                                                ? <span style={{marginLeft: '50px'}}>
                                                <strong>Accepted:</strong>&nbsp;&nbsp;
                                                    <span>{this.props.cardDetail.accepts.length}</span>
                                            </span> : null) : null
                                        }
                                    </div> : null
                            }
                            {
                                this.props.attachments.length > 0
                                && <div>
                                    <hr/>
                                    <div
                                        style={{
                                            color: '#4285f4',
                                            fontWeight: 'bold',
                                            fontSize: '1em'
                                        }}>Attachments{this.props.attachments && `(` + this.props.attachments.length + `)`}
                                    </div>
                                    <br/>
                                    {
                                        this.props.attachments.map(attachment =>
                                            <div key={attachment.attachmentId}>
                                                <i
                                                    className="fa fa-paperclip"
                                                    style={{
                                                        color: 'blue',
                                                        fontSize: '120%',
                                                    }}
                                                    aria-hidden="true"/>&nbsp;&nbsp;
                                                <a
                                                    href={attachment.attachmentName}
                                                    download
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                    style={{color: '#000'}}>
                                                    {attachment.originalFileName}
                                                </a>
                                            </div>)
                                    }
                                </div>
                            }
                            {attachComp}
                        </div>
                        <hr style={{width: '100%'}}/>
                        <div style={{margin: '0 5% 5%', width: '90%'}}>
                            <div style={{
                                color: '#4285f4',
                                fontWeight: 'bold',
                                fontSize: '1em'
                            }}>Comments
                            </div>
                            <br/>
                            {
                                this.props.comments.length > 0 ?
                                    this.props.comments.map((comment, index) =>
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
                                    ) : null
                            }
                            <br/>
                            <div className="row col-md-12" style={{margin: '10px 0', padding: '0'}}>
                                <div className="col-md-9">
                                <textarea
                                    placeholder="Please comment here."
                                    className="description form-control nofocus"
                                    onChange={this.props.onChangeCommentHandler}
                                    value={this.props.newComment}
                                    style={{
                                        minHeight: '60px',
                                        margin: '0',
                                    }}
                                />
                                </div>
                                <div className="col-md-3">
                                    <button
                                        style={{
                                            color: 'white',
                                            width: '100%',
                                            margin: 0
                                        }} type="button"
                                        onClick={this.props.postComment}
                                        className="btn btn-primary">
                                        Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <LoadingScreen isLoading={this.state.isLoading} value={this.state.loadingValue}/>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        UpdateMyActivityDetail:Actions.UpdateMyActivityDetail
    }, dispatch);
};

export default withRouter(connect(null, mapDispatchToProps)(EditActivityDetail));