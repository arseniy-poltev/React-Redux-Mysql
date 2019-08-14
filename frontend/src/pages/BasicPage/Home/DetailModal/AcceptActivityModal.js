import React from 'react';
import {Card, CardContent} from "@material-ui/core";
import {AttachFile} from "@material-ui/icons";
import axios from 'axios';
import config from '../../../../config';
import {NotificationManager} from "react-notifications";
import LoadingScreen from "../../../../containers/Loading/LoadingScreen";
import {bindActionCreators} from "redux";
import * as Actions from '../store/actions/index'
import connect from "react-redux/es/connect/connect";
import {ErrorController} from "../../../../containers/ErrorController";

class AcceptActivityModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingValue: 0,
            isLoading: false,
            // posted data
            duration: 0,
            amount: 0,
            description: '',
            attachments: null
        };
        this.onAcceptHandler = this.onAcceptHandler.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.onFileSelectHandler = this.onFileSelectHandler.bind(this);
    }

    onAcceptHandler() {
        if (this.state.description.trim() === '') {
            NotificationManager.error(`Please enter your description`);
            return;
        }
        const _this = this;
        const postData = new FormData();
        postData.append("activityId", this.props.activityId);
        postData.append("duration", this.state.duration);
        postData.append("amount", this.state.amount);
        postData.append("description", this.state.description.trim());
        postData.append("attachments", this.state.attachments);
        axios.post(`${config.baseURL}/api/activity-accept`, postData, {
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
                    _this.props.AddNewAccept(res.data.data);
                    NotificationManager.success(`You accepted successfully`);
                    _this.props.toggle(false, null);
                } else {
                    NotificationManager.error(res.data.message);
                }
            });
        }).catch(error => {
            ErrorController(error);
            _this.setState({
                isLoading: false
            }, () => {
                NotificationManager.error(error.message);
            });
        })
    }

    onChangeHandler(e) {
        switch (e.target.name) {
            case 'duration':
                if (!isNaN(Number(e.target.value))) {
                    this.setState({
                        duration: Number(e.target.value)
                    });
                }
                break;
            case 'amount':
                if (!isNaN(Number(e.target.value))) {
                    this.setState({
                        amount: Number(e.target.value)
                    });
                }
                break;
            case 'description':
                this.setState({
                    description: e.target.value
                });
                break;
            default:
                return;
        }
    }

    onFileSelectHandler(e) {
        this.setState({
            attachments: e.target.files[0]
        })
    }

    componentDidMount() {
        if (this.props.acceptedData) {
            const currDate = new Date();
            const endDate = new Date(this.props.acceptedData.deadline);
            currDate.setHours(currDate.getHours() + currDate.getTimezoneOffset() / 60);
            const diffDate = Math.round((endDate.getTime() - currDate.getTime()) / (3600 * 24 * 1000));
            this.setState({
                duration: diffDate
            })
        }
    }

    render() {
        return (
            <Card>
                <CardContent style={{padding: '0'}}>
                    <div className="row col-md-12" style={{backgroundColor: '#43425d', height: '50px', margin: '0'}}>
                        <div className="acceptTitle">
                            {
                                this.props.acceptedData
                                    ? <u>Already Accepted</u>
                                    : <u>Proposal</u>
                            }
                        </div>
                    </div>
                </CardContent>
                <CardContent>
                    <div className="row col-md-12" style={{margin: '2% 0'}}>
                        <div className="row col-md-6">
                            <span>Carried out in &nbsp;&nbsp;</span>
                            {
                                this.props.acceptedData
                                    ? <span style={{width: '10%', margin: 0, fontWeight: 'bold'}}>
                                        {this.state.duration >= 0 ? this.state.duration : 0}
                                    </span>
                                    : <input
                                        className="form-control nofocus"
                                        style={{width: '10%', margin: 0}}
                                        name="duration"
                                        onChange={(e) => this.onChangeHandler(e)}
                                        value={this.state.duration.toString()}
                                    />
                            }
                            <span>&nbsp;&nbsp;days&nbsp;&nbsp;with amount:&nbsp;&nbsp;</span>
                            {
                                this.props.acceptedData
                                    ? <span style={{width: '10%', margin: 0, fontWeight: 'bold'}}>
                                        {
                                            this.props.acceptedData.amount
                                        }
                                    </span>
                                    : <input
                                        className=" form-control nofocus"
                                        style={{width: '10%', margin: 0}}
                                        name="amount"
                                        onChange={(e) => this.onChangeHandler(e)}
                                        value={this.state.amount.toString()}
                                    />
                            }
                        </div>
                        <div className="col-md-3">
                            {
                                this.props.acceptedData
                                    ? (
                                        JSON.parse(this.props.acceptedData.attachments)
                                        && JSON.parse(this.props.acceptedData.attachments).length > 0
                                            ? <a
                                                style={{
                                                    textAlign: 'center',
                                                    color: '#73b2f8',
                                                    fontWeight: 'normal',
                                                    wordBreak: 'break-all'
                                                }}
                                                rel="noopener noreferrer"
                                                href={JSON.parse(this.props.acceptedData.attachments)[0].attachmentName}
                                                target="_blank"
                                                download>
                                                {
                                                    JSON.parse(this.props.acceptedData.attachments)[0].originalFileName
                                                }
                                            </a> : null
                                    ) : <div
                                        onClick={() => this.fileInput.click()}
                                        style={{cursor: 'pointer', textAlign: 'center'}}>
                                        <AttachFile fontSize="small" color="primary"/>
                                        {
                                            this.state.attachments
                                                ? <span>File Selected</span>
                                                : <span>Attach File</span>
                                        }
                                    </div>
                            }
                            <input
                                type="file"
                                style={{display: 'none'}}
                                ref={c => this.fileInput = c}
                                onChange={this.onFileSelectHandler}
                            />
                            {
                                this.state.attachments ?
                                    <div style={{
                                        textAlign: 'center',
                                        color: '#73b2f8',
                                        fontWeight: 'normal'
                                    }}>
                                        {this.state.attachments.name}
                                        <span
                                            style={{
                                                color: '#73b2f8',
                                                margin: 0,
                                                fontSize: '20px'
                                            }}
                                            className="close"
                                            onClick={() => this.setState({
                                                attachments: null
                                            })}>&times;</span>
                                    </div> :
                                    <span style={{height: '20px'}}>&nbsp;</span>
                            }
                        </div>
                        <div className="col-md-3">
                            <button
                                disabled={!!this.props.acceptedData}
                                type="button"
                                id="acceptCard"
                                style={{color: 'white'}}
                                className="btn btn-primary"
                                onClick={this.onAcceptHandler}
                            >Accept
                            </button>
                        </div>
                    </div>
                    <div className="row col-md-12" style={{margin: '0'}}>
                        {
                            this.props.acceptedData
                                ? <div
                                    style={{
                                        width: '100%',
                                        minHeight: '200px',
                                        border: '2px #9fdbf0 solid',
                                        whiteSpace: 'pre-wrap',
                                        padding: '10px'
                                    }}>
                                    {
                                        this.props.acceptedData.description
                                    }
                                </div>
                                : <textarea
                                    placeholder="Please write your description here."
                                    className="form-control nofocus"
                                    style={{width: '100%', minHeight: '200px'}}
                                    name="description"
                                    onChange={(e) => this.onChangeHandler(e)}
                                    value={this.state.description.toString()}
                                />
                        }
                    </div>
                </CardContent>
                <LoadingScreen isLoading={this.state.isLoading} value={this.state.loadingValue}/>
            </Card>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        AddNewAccept: Actions.AddNewAccept
    }, dispatch)
};
export default connect(null, mapDispatchToProps)(AcceptActivityModal);
