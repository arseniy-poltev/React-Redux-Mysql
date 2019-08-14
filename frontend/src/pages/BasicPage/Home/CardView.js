import React from "react";
import cn from "classnames";
import {CloudUpload, CloudDownload} from '@material-ui/icons';
import config from "../../../config";

const ACTIVITY_TYPE = config.activityType;
const ACTIVITY_TAG = config.activityTagType;

export class CardView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRecent: false
        };
        this.onClickHandler = this.onClickHandler.bind(this);
    }

    componentDidMount() {
        const postedDateTime = Math.round(new Date(this.props.postedDateTime).getTime() / 1000);
        const currDate = Math.round(new Date().getTime() / 1000);
        const strReadCardIds = localStorage.getItem("readCardIds");
        const readCardIds = strReadCardIds ? JSON.parse(strReadCardIds) : [];
        if (currDate - postedDateTime < 3600 && !readCardIds.includes(this.props.id)) {
            this.setState({
                isRecent: true
            })
        } else {
            this.setState({
                isRecent: false
            })
        }
    }

    onClickHandler(e) {
        const postedDateTime = Math.round(new Date(this.props.postedDateTime).getTime() / 1000);
        const currDate = Math.round(new Date().getTime() / 1000);
        const strReadCardIds = localStorage.getItem("readCardIds");
        const readCardIds = strReadCardIds ? JSON.parse(strReadCardIds) : [];
        if (currDate - postedDateTime < 3600 && !readCardIds.includes(this.props.id)) {
            readCardIds.push(this.props.id);
            localStorage.setItem("readCardIds", JSON.stringify(readCardIds));
        }
        if (currDate - postedDateTime > 3600 && readCardIds.includes(this.props.id)) {
            readCardIds.splice(readCardIds.indexOf(this.props.id), 1);
            localStorage.setItem("readCardIds", JSON.stringify(readCardIds));
        }
        this.setState({
            isRecent: false
        }, () => {
            this.props.onClick(true, this.props.cardInfo)
        });
    }

    render() {
        return (
            <div
                className={cn("Card", {
                    // "Card--dragging": this.props.isDragging,
                    "Card--spacer": this.props.isSpacer,
                    "Card--recent": this.state.isRecent
                })}
                onClick={(e) => this.props.isSpacer ? null : this.onClickHandler(e)}
            >
                <div className="row">
                    <div className="col-md-12">
                        {
                            this.state.isRecent ?
                                <span
                                    style={{
                                        float: 'right',
                                        color: '#c936f9',
                                        fontWeight: 'bold',
                                        fontSize: '1.2em'
                                    }}>NEW</span> : null
                        }
                    </div>
                </div>
                <div className="row col-md-12" style={{margin: '0'}}>
                    <div className="col-md-6">
                        {
                            this.props.activityTag === ACTIVITY_TAG.HIGH
                                ? <span className="badge badge-danger">High Priority</span>
                                : this.props.activityTag === ACTIVITY_TAG.MEDIUM
                                ? <span className="badge badge-success">Medium Priority</span>
                                : this.props.activityTag === ACTIVITY_TAG.LOW
                                    ? <span className="badge badge-primary">Low Priority</span>
                                    : null
                        }
                    </div>
                    <div className="col-md-6">
                        {
                            this.props.activityType === ACTIVITY_TYPE.ASK
                                ? <span style={{color: '#c28b7b', fontWeight: 'bold'}}><CloudUpload color="secondary"/> <u>Ask</u></span>
                                : this.props.activityType === ACTIVITY_TYPE.OFFER
                                ? <span style={{color: '#958fbb', fontWeight: 'bold'}}><CloudDownload color="primary"/> <u>Offer</u></span> : null
                        }
                    </div>
                    {
                        localStorage.getItem("UserInfo")
                        && this.props.userId === JSON.parse(localStorage.getItem("UserInfo")).id
                        && <div className="col-md-12">
                            <span style={{width: '100%', whiteSpace: 'normal'}} className="badge badge-secondary">Posted by myself</span>
                        </div>
                    }
                    <div className="col-md-12 mt-2">
                        <div className="Card__title">{this.props.title}</div>
                    </div>
                    <div className="col-md-12 mt-2">
                        {
                            this.props.isSpacer ? null : (
                                this.props.description.length > 250 ?
                                    <div className="Card__detail">{this.props.description.substring(0, 250)}...</div> :
                                    <div className="Card__detail">{this.props.description}</div>
                            )
                        }
                    </div>
                    <div className="row col-md-12 notice">
                        <div className="col-md-7" style={{display: 'inline'}}>
                            <i className="material-icons"
                               style={{left: "5%", color: '#ccccd7', fontSize: '100%'}}>comment</i>
                            &nbsp;&nbsp;
                            <span style={{
                                fontSize: '1.1em',
                                color: '#9f9fb4',
                                left: "20%"
                            }}>{this.props.numComments}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {
                                this.props.activityType !== ACTIVITY_TYPE.SHARED_STORIES
                                    ? <div style={{left: "35%", width: '30%'}}>
                                        <i className="fa fa-paperclip"
                                           style={{color: '#ccccd7', fontSize: '100%', fontWeight: 'bold'}}
                                           aria-hidden="true"/>
                                        &nbsp;&nbsp;
                                        <span
                                            style={{
                                                fontSize: '1.1em',
                                                color: '#9f9fb4',
                                                left: "50%"
                                            }}>{this.props.numAttachments}</span>&nbsp;&nbsp;
                                    </div>
                                    : <div style={{left: "35%", width: '30%', visibility: 'hidden'}}/>
                            }
                            {
                                this.props.activityType !== ACTIVITY_TYPE.ANNOUNCE && this.props.activityType !== ACTIVITY_TYPE.SHARED_STORIES
                                    ? <div style={{left: "65%", width: '35%'}}>
                                        <i className="fa fa-check"
                                           style={{color: '#ccccd7', fontSize: '100%', fontWeight: 'bold'}}/>
                                        &nbsp;&nbsp;
                                        <span style={{
                                            fontSize: '1.1em',
                                            color: '#9f9fb4',
                                            left: "50%"
                                        }}>{this.props.numAccepts}</span>
                                    </div> : null
                            }
                        </div>
                        <div className="col-md-5" style={{textAlign: 'center'}}>
                            <i className="material-icons"
                               style={{left: "30%", color: '#ccccd7', fontSize: "180%"}}>add_circle_outline</i>
                            <i className='fas fa-user-circle'
                               style={{left: "70%", color: '#ccccd7', fontSize: "160%"}}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}