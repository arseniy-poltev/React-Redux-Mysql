import React from 'react';
import {FuseAnimateGroup} from "../../../@fuse";
import {Card, CardActionArea, CardContent, CardHeader, Tooltip} from "@material-ui/core";
import {AccountCircle, AttachFile, Check, Comment} from "@material-ui/icons";
import config from "../../../config";
import DetailModalComponent from "../Home/DetailModal";
import connect from "react-redux/es/connect/connect";

const ACTIVITY_TYPE = config.activityType;
const ACTIVITY_STATUS = config.activityStatus;

class TabAcceptedData extends React.Component {
    constructor() {
        super();
        this.state = {
            showDetailModal: false,
            activeCard: null,
        };
        this.toggleDetailModal = this.toggleDetailModal.bind(this);
    }

    toggleDetailModal(isOpen, card) {
        this.setState({
            activeCard: card ? card : null,
            showDetailModal: isOpen
        })
    }

    render() {
        return (
            <div>
                <FuseAnimateGroup
                    className="flex flex-wrap"
                    enter={{
                        animation: "transition.slideUpBigIn"
                    }}>
                    <div
                        className="widget flex w-full sm:w-1/2 col-md-12 p-12"
                        style={{color: '#5f5f5f'}}>
                        <Card className="col-md-12" style={{color: '#5e5e5e'}}>
                            <CardHeader title="I Accepted"/>
                            <hr style={{margin: 0}}/>
                            <CardContent>
                                {
                                    this.props.myAccepts && this.props.myAccepts.map(acceptedData =>
                                        <div key={acceptedData.id}>
                                            <CardActionArea
                                                onClick={() => this.toggleDetailModal(true, acceptedData)}
                                                style={{
                                                    backgroundColor:
                                                        acceptedData.activityType === ACTIVITY_TYPE.ASK
                                                            ? '#fff0ed'
                                                            : acceptedData.activityType === ACTIVITY_TYPE.OFFER
                                                            ? '#eaf6db'
                                                            : acceptedData.activityType === ACTIVITY_TYPE.ANNOUNCE
                                                                ? '#e3fff5'
                                                                : acceptedData.activityType === ACTIVITY_TYPE.SHARED_STORIES
                                                                    ? '#eff4ff' : null
                                                }}>
                                                <div className="row col-md-12" style={{margin: '5px 0'}}>
                                                    <div className="row col-md-2"
                                                         style={{margin: '0', padding: '0'}}>
                                                        <div className="col-md-4"
                                                             style={{textAlign: 'center', padding: '0'}}>
                                                            {
                                                                acceptedData.status === ACTIVITY_STATUS.ACTIVE
                                                                    ? <div
                                                                        className="badge badge-info">Active</div>
                                                                    : <div
                                                                        className="badge badge-danger">Inactive</div>
                                                            }
                                                        </div>
                                                        <div className="col-md-5"
                                                             style={{textAlign: 'center', padding: '0'}}>
                                                            {
                                                                new Date(acceptedData.endDate) > new Date()
                                                                    ? <div className="badge badge-info">In
                                                                        Progress</div>
                                                                    : <div
                                                                        className="badge badge-danger">Expired</div>
                                                            }
                                                        </div>
                                                        <div className="col-md-3"
                                                             style={{textAlign: 'center', padding: '0'}}>
                                                            <Tooltip
                                                                title={acceptedData.firstName + ' ' + acceptedData.lastName}
                                                                placement="bottom">
                                                                <AccountCircle/>
                                                            </Tooltip>
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
                                                            }}>{acceptedData.title}</div>
                                                        <div
                                                            className="col-md-7"
                                                            style={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}>{acceptedData.description}</div>
                                                        <div className="col-md-1"
                                                             style={{textAlign: 'center', padding: '0'}}>
                                                            <Comment fontSize="small"/>
                                                            &nbsp; {JSON.parse(acceptedData.comments).length}
                                                        </div>
                                                        <div className="col-md-1"
                                                             style={{textAlign: 'center', padding: '0'}}>
                                                            <AttachFile fontSize="small"/>
                                                            &nbsp; {JSON.parse(acceptedData.attachments).length}
                                                        </div>
                                                        <div className="col-md-1"
                                                             style={{textAlign: 'center', padding: '0'}}>
                                                            <Check
                                                                fontSize="small"/>&nbsp; {acceptedData.accepts.length}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardActionArea>
                                            <hr style={{margin: '0'}}/>
                                        </div>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </div>
                </FuseAnimateGroup>
                {
                    this.state.showDetailModal ?
                        <DetailModalComponent
                            isOpen={this.state.showDetailModal}
                            toggleModal={this.toggleDetailModal}
                            cardDetail={this.state.activeCard}
                        /> :
                        null
                }
            </div>
        );
    }
}

const mapStateToProps = ({MyActivityStates}) => {
    return {myAccepts: MyActivityStates.myActivities.myAccepts,}
};

export default connect(mapStateToProps)(TabAcceptedData);