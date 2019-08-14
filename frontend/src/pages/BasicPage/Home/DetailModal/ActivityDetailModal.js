import React from 'react';
import {Card, CardContent} from "@material-ui/core";
import config from '../../../../config';

export default class ActivityDetailModal extends React.Component {
    render() {
        return (
            <Card>
                <CardContent>
                    <div className="detailTitle">
                <span style={{
                    whiteSpace: "normal",
                    wordWrap: "break-word"
                }}>{this.props.cardDetail.title}</span>
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
                        <div
                            style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                            {this.props.cardDetail.description}
                        </div>
                        {
                            this.props.cardDetail.activityType !== config.activityType.SHARED_STORIES
                                ? <div>
                                    <hr/>
                                    <span>
                                <strong>Expire Date:</strong>&nbsp;&nbsp;
                                        <span>{new Date(this.props.cardDetail.endDate).toLocaleDateString()}</span>
                            </span>
                                    <span style={{marginLeft: '50px'}}>
                                <strong>Price:</strong>&nbsp;&nbsp;
                                        <span>{this.props.cardDetail.amount}</span>
                            </span>
                                    {
                                        this.props.cardDetail.activityType !== config.activityType.ANNOUNCE
                                            ? <span style={{marginLeft: '50px'}}>
                                                <strong>Accepted:</strong>&nbsp;&nbsp;
                                                <span>{this.props.cardDetail.accepts.length}</span>
                                            </span> : null
                                    }
                                </div> : null
                        }
                        {
                            this.props.attachments.length > 0 ?
                                <div>
                                    <hr/>
                                    <div
                                        style={{
                                            color: '#4285f4',
                                            fontWeight: 'bold',
                                            fontSize: '1em'
                                        }}>Attachments({this.props.attachments.length})
                                    </div>
                                    <br/>
                                    {
                                        this.props.attachments.length > 0
                                            ? this.props.attachments.map(attachment =>
                                                <div key={attachment.attachmentId}>
                                                    <i className="fa fa-paperclip"
                                                       style={{
                                                           color: 'blue',
                                                           fontSize: '120%',
                                                       }}
                                                       aria-hidden="true"/>&nbsp;&nbsp;
                                                    <a href={attachment.attachmentName}
                                                       download
                                                       rel="noopener noreferrer"
                                                       target="_blank"
                                                       style={{color: '#000'}}>
                                                        {attachment.originalFileName}
                                                    </a>
                                                </div>) : null
                                    }
                                </div> : null
                        }
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
        );
    }
}