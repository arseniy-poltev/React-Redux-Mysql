import React from 'react';
import {MDBContainer, MDBModal, MDBModalBody} from 'mdbreact';
import axios from 'axios';
import config from "../../../../config";
import {bindActionCreators} from "redux";
import * as Actions from '../store/actions/index'
import connect from "react-redux/es/connect/connect";
import './style.css';
import ActivityDetailModal from "./ActivityDetailModal";
import AcceptActivityModal from "./AcceptActivityModal";
import {ErrorController} from "../../../../containers/ErrorController";
import {getDiffStr} from "../../../../containers/GlobalFunc";

class DetailModal extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.onChangeCommentHandler = this.onChangeCommentHandler.bind(this);
        this.postComment = this.postComment.bind(this);
        this.state = {
            diffStartDateTime: '',
            height: '0',
            newComment: '',
            attachments: [],
            comments: []
        }
    }

    componentDidMount() {
        const startDate = new Date(this.props.cardDetail.startDate);
        this.setState({
            diffStartDateTime: getDiffStr(startDate),
            attachments: JSON.parse(this.props.cardDetail.attachments),
            comments: JSON.parse(this.props.cardDetail.comments)
        })
    }

    toggle() {
        this.props.toggleModal(!this.props.isOpen, null);
    };

    onChangeCommentHandler(e) {
        this.setState({
            newComment: e.target.value,
            // height: e.target.scrollHeight + "px"
        });
    }

    postComment(e) {
        if (this.state.newComment.trim() !== '') {
            const postData = {
                id: this.props.cardDetail.id,
                comment: this.state.newComment.trim()
            };
            axios.post(`${config.baseURL}/api/activity-add-comments`, postData, {
                headers: {
                    token: localStorage.getItem("UserToken"),
                }
            }).then(res => {
                if (res.data.code === 200) {
                    this.props.AddNewComment(res.data.data);
                    this.setState({
                        comments: JSON.parse(res.data.data.comments),
                        newComment: ''
                    });
                }
            }).catch(ErrorController)
        }
    }

    render() {
        return (
            <MDBContainer id="cardDetailModal">
                <MDBModal
                    isOpen={this.props.isOpen}
                    toggle={this.toggle}
                    fullHeight position="right"
                    size={'lg'}>
                    <MDBModalBody>
                        <div className="col-md-12" style={{margin: '0', width: '100%'}}>
                            <div className="row">
                                <div onClick={this.toggle} className="close">{'<'}</div>
                            </div>
                        </div>
                        <ActivityDetailModal
                            cardDetail={this.props.cardDetail}
                            diffStartDateTime={this.state.diffStartDateTime}
                            attachments={this.state.attachments}
                            comments={this.state.comments}
                            newComment={this.state.newComment}
                            onChangeCommentHandler={this.onChangeCommentHandler}
                            postComment={this.postComment}
                        /><br/><br/>
                        {
                            this.props.cardDetail.userId !== JSON.parse(localStorage.getItem("UserInfo")).id &&
                            (this.props.cardDetail.activityType === config.activityType.ASK
                                || this.props.cardDetail.activityType === config.activityType.OFFER) ?
                                <AcceptActivityModal
                                    acceptedData={
                                        this.props.cardDetail.accepts.find(
                                            accept => accept.userId === JSON.parse(localStorage.getItem("UserInfo")).id
                                        )
                                    }
                                    activityId={this.props.cardDetail.id}
                                    toggle={this.toggle}
                                /> : null
                        }
                    </MDBModalBody>
                </MDBModal>
            </MDBContainer>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        AddNewComment: Actions.AddNewComment
    }, dispatch)
};
export default connect(null, mapDispatchToProps)(DetailModal);
