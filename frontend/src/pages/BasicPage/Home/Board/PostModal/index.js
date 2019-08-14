import React from "react";
import axios from "axios";
import {Modal, ModalHeader, ModalBody} from 'reactstrap';
import {Menu, MenuItem} from '@material-ui/core';
import {Announcement, Share, ThumbsUpDown} from '@material-ui/icons';
import config from "../../../../../config";
import {NotificationManager} from "react-notifications";
import "react-notifications/lib/notifications.css";
import LoadingScreen from "../../../../../containers/Loading/LoadingScreen";
import './style.css';
import {ErrorController} from "../../../../../containers/ErrorController";

const ACTIVITY_TYPE = config.activityType;
const ACTIVITY_TAG = config.activityTagType;

class PostModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            optText: 'More Options',
            showMore: false,
            isLoading: false,
            loadingValue: 0,
            textAreaHeight: '0',
            anchorEl: null,
            //required data
            title: '',
            description: '',
            activityType: ACTIVITY_TYPE.ASK,
            amount: 0,
            //optional data
            attachments: null,
            activityTag: ACTIVITY_TAG.LOW,
            duration: 6,
            status: true,
            isEmergency: false
        };
        this.toggle = this.toggle.bind(this);
        PostModal.changePostMethod = PostModal.changePostMethod.bind(this);
        this.clickMoreOptions = this.clickMoreOptions.bind(this);
        this.changeSelectedItem = this.changeSelectedItem.bind(this);
        this.postNewActivity = this.postNewActivity.bind(this);
        this.changeAmount = this.changeAmount.bind(this);
        this.addCard = this.addCard.bind(this);
        this.changeEndDate = this.changeEndDate.bind(this);
        this.setPriority = this.setPriority.bind(this);
        this.fileSelectHandler = this.fileSelectHandler.bind(this);
        this.editText = this.editText.bind(this);
        this.onOptionClickHandler = this.onOptionClickHandler.bind(this);
    }

    componentDidMount() {
        this.setState({
            title: this.props.title.trim(),
            activityType: this.props.activityType
        });
    }

    toggle() {
        this.props.toggleModal();
    }

    static changePostMethod(e) {
        if (e.target.innerText === "Buy") {
            e.target.innerText = "Sell";
        } else {
            e.target.innerText = "Buy";
        }
    }

    clickMoreOptions() {
        this.setState({
            showMore: !this.state.showMore
        }, () => {
            if (this.state.showMore) {
                this.setState({
                    optText: 'Less Options'
                })
            } else {
                this.setState({
                    optText: 'More Options'
                })
            }
        });
    }

    changeSelectedItem(nItem) {
        if (nItem === ACTIVITY_TYPE.SHARED_STORIES) {
            this.setState({
                showMore: false
            })
        }
        this.setState({
            activityType: nItem,
        })
    }

    changeAmount(e) {
        const amount = Number(e.target.value);
        if (!isNaN(amount)) {
            this.setState({
                amount,
            })
        }
    }

    addCard(card) {
        this.props.addCard(card);
    }

    changeEndDate(e) {
        const duration = Number(e.target.value);
        if (!isNaN(duration)) {
            this.setState({
                duration,
            })
        }
    }

    editText(e) {
        const value = e.target.value;
        const key = e.target.name;
        if (key === "title") {
            this.setState({
                title: value
            })
        } else {
            this.setState({
                description: value,
                // textAreaHeight: e.target.scrollHeight + "px"
            })
        }
    }

    setPriority(index) {
        this.setState({
            activityTag: index,
            anchorEl: null
        })
    }

    fileSelectHandler(e) {
        this.setState({
            attachments: e.target.files[0],
        })
    }

    onOptionClickHandler(e) {
        this.setState({
            activityType: Number(e.target.value)
        })
    }

    postNewActivity() {
        if (this.state.title.trim() === '') {
            NotificationManager.error("Please enter your title");
            return;
        }
        if (this.state.description.trim() === '') {
            NotificationManager.error("Please enter correct description");
            return;
        }
        const _this = this;
        const postData = new FormData();
        postData.append("title", this.state.title.trim());
        postData.append("description", this.state.description.trim());
        postData.append("activityType", this.state.activityType);
        postData.append("amount", this.state.amount);
        postData.append("attachments", this.state.attachments);
        postData.append("duration", this.state.duration);
        postData.append("activityTag", this.state.activityTag);
        postData.append("isEmergency", this.state.isEmergency);
        postData.append("status", this.state.status);
        postData.append("communityId", this.props.communityId);
        axios.post(`${config.baseURL}/api/activity-create`, postData, {
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
                    _this.addCard(res.data.data);
                    setTimeout(function () {
                        _this.toggle();
                    }, 600);
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
                setTimeout(function () {
                    _this.toggle();
                }, 600);
            });
        })
    }

    render() {
        let activity;
        let activityButtonsGroup;
        switch (this.state.activityType) {
            case ACTIVITY_TYPE.ASK:
            case ACTIVITY_TYPE.OFFER:
                activity =
                    <h6 className="modal-title" id="postModalTitle">
                        Write here what you are asking or offer
                    </h6>;
                activityButtonsGroup =
                    <div className="col-md-2 activityTypeGroup" style={{textAlign: 'center'}}>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="true"
                            className="btn btn-ghost-primary ask focus active"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.ASK)}>
                            {/*<img src={require('../../images/up.svg')}/>*/}
                            <ThumbsUpDown/>
                            <br/>
                            <span>Ask/Offer</span><br/><br/>
                        </button>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="false"
                            className="btn btn-ghost-primary offer"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.ANNOUNCE)}>
                            {/*<img src={require('../../images/down.svg')}/>*/}
                            <Announcement/>
                            <br/>
                            <span>Announce</span><br/><br/>
                        </button>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="true"
                            className="btn btn-ghost-primary announce"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.SHARED_STORIES)}>
                            {/*<img src={require('../../images/announce.svg')}/>*/}
                            <Share/>
                            <br/>
                            <span>Share Story</span><br/><br/>
                        </button>
                    </div>;
                break;
            case ACTIVITY_TYPE.ANNOUNCE:
                activity =
                    <h6 className="modal-title" id="postModalTitle">
                        Write here what you are announcing
                    </h6>;
                activityButtonsGroup =
                    <div className="col-md-2 activityTypeGroup" style={{textAlign: 'center'}}>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="false"
                            className="btn btn-ghost-primary ask"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.ASK)}>
                            {/*<img src={require('../../images/up.svg')}/>*/}
                            <ThumbsUpDown/>
                            <br/>
                            <span>Ask/Offer</span><br/><br/>
                        </button>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="false"
                            className="btn btn-ghost-primary offer focus active"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.ANNOUNCE)}>
                            {/*<img src={require('../../images/down.svg')}/>*/}
                            <Announcement/>
                            <br/>
                            <span>Announce</span><br/><br/>
                        </button>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="true"
                            className="btn btn-ghost-primary announce"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.SHARED_STORIES)}>
                            {/*<img src={require('../../images/announce.svg')}/>*/}
                            <Share/>
                            <br/>
                            <span>Share Story</span><br/><br/>
                        </button>
                    </div>;
                break;
            case ACTIVITY_TYPE.SHARED_STORIES:
                activity =
                    <h6 className="modal-title" id="postModalTitle">
                        Write here what you are sharing
                    </h6>;
                activityButtonsGroup =
                    <div className="col-md-2 activityTypeGroup" style={{textAlign: 'center'}}>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="false"
                            className="btn btn-ghost-primary ask"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.ASK)}>
                            {/*<img src={require('../../images/up.svg')}/>*/}
                            <ThumbsUpDown/>
                            <br/>
                            <span>Ask/Offer</span><br/><br/>
                        </button>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="false"
                            className="btn btn-ghost-primary offer"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.ANNOUNCE)}>
                            {/*<img src={require('../../images/announce.svg')}/>*/}
                            <Announcement/>
                            <br/>
                            <span>Announce</span><br/><br/>
                        </button>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="true"
                            className="btn btn-ghost-primary announce focus active"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.SHARED_STORIES)}>
                            {/*<img src={require('../../images/announce.svg')}/>*/}
                            <Share/>
                            <br/>
                            <span>Share Story</span><br/><br/>
                        </button>
                    </div>;
                break;
            default:
                activity =
                    <h6 className="modal-title" id="postModalTitle">
                        Write here what you are asking or offer
                    </h6>;
                activityButtonsGroup =
                    <div className="col-md-2 activityTypeGroup" style={{textAlign: 'center'}}>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="true"
                            className="btn btn-ghost-primary ask focus active"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.ASK)}>
                            {/*<img src={require('../../images/up.svg')}/>*/}
                            <ThumbsUpDown/>
                            <br/>
                            <span>Ask/Offer</span><br/><br/>
                        </button>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="false"
                            className="btn btn-ghost-primary offer"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.ANNOUNCE)}>
                            {/*<img src={require('../../images/down.svg')}/>*/}
                            <Announcement/>
                            <br/>
                            <span>Announce</span><br/><br/>
                        </button>
                        <button
                            type="button"
                            data-toggle="button"
                            aria-pressed="true"
                            className="btn btn-ghost-primary announce"
                            onClick={() => this.changeSelectedItem(ACTIVITY_TYPE.SHARED_STORIES)}>
                            {/*<img src={require('../../images/announce.svg')}/>*/}
                            <Share/>
                            <br/>
                            <span>Share Story</span><br/><br/>
                        </button>
                    </div>;
                break;
        }
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + Number(this.state.duration));
        const {anchorEl} = this.state;
        return (
            <div>
                <Modal
                    isOpen={this.props.isOpen}
                    backdrop={'static'}
                    toggle={this.toggle}
                    role={'dialog'}
                    id="postModal"
                    size={'lg'}
                >
                    <ModalHeader toggle={this.toggle}/>
                    <ModalBody className={'row'}>
                        {activityButtonsGroup}
                        <div className="col-md-10">
                            {activity}
                            <input
                                className="title1 form-control nofocus"
                                name="title"
                                autoComplete="off"
                                onChange={this.editText}
                                placeholder="Title"
                                value={this.state.title}
                            /><br/>
                            <textarea
                                className="description form-control nofocus"
                                name="description"
                                placeholder="Description"
                                onChange={this.editText}
                                // style={{height: this.state.textAreaHeight}}
                                value={this.state.description}
                            />
                            {
                                this.state.showMore ? (
                                    <div className="attach">
                                        <div style={{display: 'inline-block', float: 'left'}}>
                                            <input
                                                type="file"
                                                style={{display: 'none'}}
                                                ref={c => this.fileSelector = c}
                                                onChange={this.fileSelectHandler}
                                            />
                                            <span
                                                style={{cursor: 'pointer'}}
                                                onClick={() => this.fileSelector.click()
                                                }>
                                                <i className="fa fa-paperclip" style={{color: 'blue'}}/>&nbsp;
                                                {this.state.attachments ? `File Selected` : `Attach file`}
                                            </span><br/>
                                            {
                                                this.state.attachments ?
                                                    <div style={{
                                                        textAlign: 'center',
                                                        color: '#73b2f8',
                                                        fontWeight: 'normal'
                                                    }}>
                                                        {this.state.attachments.name}
                                                        <span style={{color: '#73b2f8'}} className="close"
                                                              onClick={() => this.setState({
                                                                  attachments: null
                                                              })}>&times;</span>
                                                    </div> :
                                                    <span style={{height: '20px'}}>&nbsp;</span>
                                            }
                                        </div>
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                        <div
                                            className="dropdown"
                                            style={{display: 'inline-block', float: 'left', marginLeft: '20px'}}>
                                            <span
                                                aria-owns={anchorEl ? 'simple-menu' : undefined}
                                                aria-haspopup="true"
                                                style={{cursor: 'pointer'}}
                                                onClick={(event) => this.setState({anchorEl: event.currentTarget})}
                                            >
                                            <i className="fa fa-tag"/>&nbsp;
                                                {this.state.activityTag === ACTIVITY_TAG.LOW ? `Low` : (
                                                    this.state.activityTag === ACTIVITY_TAG.MEDIUM ? `Medium` : (
                                                        this.state.activityTag === ACTIVITY_TAG.HIGH ? `High` : `Tag`
                                                    )
                                                )}
                                            </span>
                                            <Menu
                                                id="simple-menu"
                                                anchorEl={anchorEl}
                                                open={Boolean(anchorEl)}
                                                onClose={(e) => this.setPriority(1)}
                                            >
                                                <MenuItem
                                                    onClick={(e) => this.setPriority(ACTIVITY_TAG.LOW)}>Low</MenuItem>
                                                <MenuItem
                                                    onClick={(e) => this.setPriority(ACTIVITY_TAG.MEDIUM)}>Medium</MenuItem>
                                                <MenuItem
                                                    onClick={(e) => this.setPriority(ACTIVITY_TAG.HIGH)}>High</MenuItem>
                                            </Menu>
                                        </div>
                                    </div>
                                ) : <div/>
                            }
                            {
                                this.state.activityType !== ACTIVITY_TYPE.SHARED_STORIES
                                    ? <div className="question">
                                        <div style={{display: 'inline-block'}}>
                                            Do you want to&nbsp;&nbsp;
                                            <span className="badge badge-primary"
                                                  onClick={PostModal.changePostMethod}>Buy</span>&nbsp;&nbsp;
                                            Add Sum&nbsp;&nbsp;&nbsp;
                                            <input
                                                placeholder="$"
                                                name="amount"
                                                className="form-control nofocus amount"
                                                onChange={this.changeAmount}
                                                value={this.state.amount}
                                            />
                                        </div>
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                        <div className="custom-control custom-checkbox custom-control-inline">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="chbEmergency"
                                                checked={this.state.isEmergency}
                                                onChange={() => this.setState({isEmergency: !this.state.isEmergency})}
                                            />
                                            <label style={{color: 'red'}} className="custom-control-label"
                                                   htmlFor="chbEmergency">Emergency</label><br/>
                                            <span style={{height: '20px'}}>&nbsp;</span>
                                        </div>
                                        {
                                            this.state.activityType !== ACTIVITY_TYPE.ANNOUNCE
                                            && this.state.activityType !== ACTIVITY_TYPE.SHARED_STORIES
                                                ? <div style={{display: 'inline-block'}}>
                                                    <div className="custom-control custom-radio custom-control-inline">
                                                        <input
                                                            readOnly={true}
                                                            checked={this.state.activityType === ACTIVITY_TYPE.ASK}
                                                            type="radio"
                                                            className="custom-control-input"
                                                            name="post-opt-radio"
                                                            onClick={this.onOptionClickHandler}
                                                            id="post-opt-radio1"
                                                            value={ACTIVITY_TYPE.ASK}
                                                        />
                                                        <label className="custom-control-label" htmlFor="post-opt-radio1">
                                                            Ask for
                                                        </label>
                                                    </div>
                                                    <div className="custom-control custom-radio custom-control-inline">
                                                        <input
                                                            readOnly={true}
                                                            checked={this.state.activityType === ACTIVITY_TYPE.OFFER}
                                                            type="radio"
                                                            className="custom-control-input"
                                                            id="post-opt-radio2"
                                                            onClick={this.onOptionClickHandler}
                                                            name="post-opt-radio"
                                                            value={ACTIVITY_TYPE.OFFER}
                                                        />
                                                        <label className="custom-control-label" htmlFor="post-opt-radio2">
                                                            Offer
                                                        </label>
                                                    </div>
                                                </div> : null
                                        }

                                    </div> : null
                            }
                            {
                                this.state.showMore ? (
                                    <div className="duration">
                                        <div>
                                            Start Now&nbsp;&nbsp;
                                            <i className="fa fa-calendar"/><br/>
                                        </div>
                                        <div className="form-inline">
                                            Expire/End after&nbsp;&nbsp;
                                            <input
                                                type="number"
                                                min="1"
                                                className="form-control days"
                                                onChange={this.changeEndDate}
                                                value={this.state.duration}/>
                                            &nbsp;&nbsp;
                                            <select style={{border: 'none', display: 'inline'}}
                                                    className="custom-select my-1 mr-sm-2">
                                                <option>Days</option>
                                            </select>
                                            &nbsp;&nbsp;
                                            <span>{endDate.toDateString()}</span>
                                            &nbsp;&nbsp;
                                            <i className="fa fa-calendar"/>
                                        </div>
                                        <div>
                                            Status:&nbsp;&nbsp;
                                            <div className="custom-control custom-checkbox custom-control-inline">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="status"
                                                    required
                                                    onClick={() => this.setState(prevState => ({
                                                        status: !prevState.status
                                                    }))}
                                                    defaultChecked={true}
                                                />
                                                <label className="custom-control-label" htmlFor="status">Active</label>
                                            </div>
                                        </div>
                                    </div>
                                ) : <div/>
                            }
                            <div className="buttonGroup">
                                {
                                    this.state.activityType !== ACTIVITY_TYPE.SHARED_STORIES
                                        ? <button
                                            type="button"
                                            className="btn btn-square btn-dark"
                                            onClick={() => this.clickMoreOptions()}>
                                            {this.state.optText}
                                        </button>
                                        : <button
                                            style={{visibility: 'hidden'}}>
                                        </button>
                                }
                                <button
                                    type="button"
                                    className="btn btn-square btn-primary post"
                                    onClick={this.postNewActivity}
                                >Publish
                                </button>
                            </div>
                        </div>
                    </ModalBody>
                    <LoadingScreen isLoading={this.state.isLoading} value={this.state.loadingValue}/>
                </Modal>
            </div>
        )
    }
}

export default PostModal;
