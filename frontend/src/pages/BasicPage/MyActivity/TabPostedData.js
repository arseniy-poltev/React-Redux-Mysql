import React from 'react';
import {withRouter} from 'react-router-dom';
import {FuseAnimateGroup} from "../../../@fuse";
import {Card, CardActionArea, CardContent, CardHeader, IconButton} from "@material-ui/core";
import {AttachFile, Check, Comment, MoreVert} from "@material-ui/icons";
import config from "../../../config";
import connect from "react-redux/es/connect/connect";
import {bindActionCreators} from "redux";
import * as Actions from './store/actions'

const ACTIVITY_TYPE = config.activityType;
const ACTIVITY_STATUS = config.activityStatus;
const TabPostedData = ({myPosts, SetActiveCard, history}) => (
    myPosts ? <FuseAnimateGroup
        className="flex flex-wrap"
        enter={{
            animation: "transition.slideUpBigIn"
        }}>
        <div
            className="widget flex w-full sm:w-1/2 p-12 row"
            style={{
                width: '100%',
                margin: '0 0 20px',
                left: '0'
            }}>
            <div className="col-md-3">
                <Card className="widget p-12" style={{height: '250px'}}>
                    <CardContent style={{height: '70%', position: 'relative'}}>
                        <div>
                            <span style={{color: '#616161', fontSize: '1.2em'}}>Posted</span>
                            <IconButton style={{float: 'right', padding: 0}}>
                                <MoreVert/>
                            </IconButton>
                        </div>
                        <div className="numPosts"
                             style={{color: '#3490dc'}}>{myPosts.length}</div>
                    </CardContent>
                    <hr style={{margin: '8px 0'}}/>
                    <CardContent style={{height: '30%'}}>
                        <div style={{color: '#949494'}}>
                            Active:&nbsp;
                            {myPosts.filter(
                                postData => postData.status === ACTIVITY_STATUS.ACTIVE
                            ).length}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="col-md-3">
                <Card className="widget p-12" style={{height: '250px'}}>
                    <CardContent style={{height: '70%', position: 'relative'}}>
                        <div>
                            <span
                                style={{color: '#616161', fontSize: '1.2em'}}>Asking For</span>
                            <IconButton style={{float: 'right', padding: 0}}>
                                <MoreVert/>
                            </IconButton>
                        </div>
                        <div className="numPosts" style={{color: '#e3342f'}}>
                            {myPosts.filter(
                                postData => postData.activityType === ACTIVITY_TYPE.ASK
                            ).length}
                        </div>
                    </CardContent>
                    <hr style={{margin: '8px 0'}}/>
                    <CardContent style={{height: '30%'}}>
                        <div style={{color: '#949494'}}>
                            Active:&nbsp;
                            {myPosts.filter(
                                postData => postData.activityType === ACTIVITY_TYPE.ASK
                            ).filter(
                                postData => postData.status === ACTIVITY_STATUS.ACTIVE
                            ).length}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="col-md-3">
                <Card className="widget p-12" style={{height: '250px'}}>
                    <CardContent style={{height: '70%', position: 'relative'}}>
                        <div>
                            <span style={{color: '#616161', fontSize: '1.2em'}}>Offer</span>
                            <IconButton style={{float: 'right', padding: 0}}>
                                <MoreVert/>
                            </IconButton>
                        </div>
                        <div className="numPosts" style={{color: '#f6993f'}}>
                            {myPosts.filter(
                                postData => postData.activityType === ACTIVITY_TYPE.OFFER
                            ).length}
                        </div>
                    </CardContent>
                    <hr style={{margin: '8px 0'}}/>
                    <CardContent style={{height: '30%'}}>
                        <div style={{color: '#949494'}}>
                            Active:&nbsp;
                            {myPosts.filter(
                                postData => postData.activityType === ACTIVITY_TYPE.OFFER
                            ).filter(
                                postData => postData.status === ACTIVITY_STATUS.ACTIVE
                            ).length}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="col-md-3">
                <Card className="widget p-12" style={{height: '250px'}}>
                    <CardContent style={{height: '70%', position: 'relative'}}>
                        <div>
                            <span style={{color: '#616161', fontSize: '1.2em'}}>Others</span>
                            <IconButton style={{float: 'right', padding: 0}}>
                                <MoreVert/>
                            </IconButton>
                        </div>
                        <div className="numPosts" style={{color: '#37be70'}}>
                            {myPosts.filter(
                                postData =>
                                    postData.activityType !== ACTIVITY_TYPE.ASK &&
                                    postData.activityType !== ACTIVITY_TYPE.OFFER
                            ).length}
                        </div>
                    </CardContent>
                    <hr style={{margin: '8px 0'}}/>
                    <CardContent style={{height: '30%'}}>
                        <div style={{color: '#949494'}}>
                            Active:&nbsp;
                            {myPosts.filter(
                                postData =>
                                    postData.activityType !== ACTIVITY_TYPE.ASK &&
                                    postData.activityType !== ACTIVITY_TYPE.OFFER
                            ).filter(
                                postData => postData.status === ACTIVITY_STATUS.ACTIVE
                            ).length}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        <div
            className="widget flex w-full sm:w-1/2 col-md-12 p-12"
            style={{color: '#5f5f5f'}}>
            <Card className="col-md-12" style={{color: '#5e5e5e'}}>
                <CardHeader title="I Posted"/>
                <hr style={{margin: 0}}/>
                <CardContent>
                    {myPosts.map(postData =>
                        <div key={postData.id}>
                            <CardActionArea
                                onClick={() => {
                                    SetActiveCard(postData);
                                    history.push("/detail")
                                }}
                                style={{
                                    backgroundColor:
                                        postData.activityType === ACTIVITY_TYPE.ASK
                                            ? '#fff0ed'
                                            : postData.activityType === ACTIVITY_TYPE.OFFER
                                            ? '#eaf6db'
                                            : postData.activityType === ACTIVITY_TYPE.ANNOUNCE
                                                ? '#e3fff5'
                                                : postData.activityType === ACTIVITY_TYPE.SHARED_STORIES
                                                    ? '#eff4ff' : null
                                }}>
                                <div className="row col-md-12" style={{margin: '5px 0'}}>
                                    <div className="row col-md-2"
                                         style={{margin: '0', padding: '0'}}>
                                        <div className="col-md-5"
                                             style={{textAlign: 'center', padding: '0'}}>
                                            {
                                                postData.status === ACTIVITY_STATUS.ACTIVE
                                                    ? <div
                                                        className="badge badge-info">Active</div>
                                                    : <div
                                                        className="badge badge-danger">Inactive</div>
                                            }
                                        </div>
                                        <div className="col-md-7"
                                             style={{textAlign: 'center', padding: '0'}}>
                                            {
                                                new Date(postData.endDate) > new Date()
                                                    ? <div className="badge badge-info">In Progress</div>
                                                    : <div
                                                        className="badge badge-danger">Expired</div>
                                            }
                                        </div>
                                    </div>
                                    <div className="row col-md-10"
                                         style={{margin: '0', padding: '0'}}>
                                        <div
                                            className="col-md-2"
                                            style={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>{postData.title}</div>
                                        <div
                                            className="col-md-7"
                                            style={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>{postData.description}</div>
                                        <div className="col-md-1"
                                             style={{textAlign: 'center', padding: '0'}}>
                                            <Comment fontSize="small"/>
                                            &nbsp; {JSON.parse(postData.comments).length}
                                        </div>
                                        <div className="col-md-1"
                                             style={{textAlign: 'center', padding: '0'}}>
                                            <AttachFile fontSize="small"/>
                                            &nbsp; {JSON.parse(postData.attachments).length}
                                        </div>
                                        <div className="col-md-1"
                                             style={{textAlign: 'center', padding: '0'}}>
                                            <Check
                                                fontSize="small"/>&nbsp; {postData.accepts.length}
                                        </div>
                                    </div>
                                </div>
                            </CardActionArea>
                            <hr style={{margin: '0'}}/>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </FuseAnimateGroup> : <div/>
);
const mapStateToProps = ({MyActivityStates}) => {
    return {myPosts: MyActivityStates.myActivities.myPosts,}
};
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        SetActiveCard: Actions.SetActiveCard
    }, dispatch)
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TabPostedData));