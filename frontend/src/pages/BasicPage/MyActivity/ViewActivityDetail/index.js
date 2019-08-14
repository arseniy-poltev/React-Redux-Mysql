import React from 'react';
import EditActivityDetail from "./EditActivityDetail";
import config from "../../../../config";
import AcceptList from "./AcceptList";
import axios from "axios";
import {withRouter} from "react-router-dom";
import connect from "react-redux/es/connect/connect";
import {bindActionCreators} from "redux";
import * as Actions from '../../Home/store/actions/index'
import './styles.css';
import {Card, CardContent} from "@material-ui/core";
import {ErrorController} from "../../../../containers/ErrorController";
import {getDiffStr} from "../../../../containers/GlobalFunc";

class ViewActivityDetail extends React.Component {
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
        if (!this.props.activeCard || Object.keys(this.props.activeCard).length <= 0) {
            this.toggle(false, null);
            return null;
        }
        this.setState({
            diffStartDateTime: getDiffStr(new Date(this.props.activeCard.startDate)),
            attachments: JSON.parse(this.props.activeCard.attachments),
            comments: JSON.parse(this.props.activeCard.comments)
        })
    }

    toggle(isShowDetail) {
        if (!isShowDetail) {
            this.props.history.push({pathname: "/my-activity"});
        }
    };

    onChangeCommentHandler(e) {
        this.setState({
            newComment: e.target.value,
        });
    }

    postComment(e) {
        if (this.state.newComment.trim() !== '') {
            const postData = {
                id: this.props.activeCard.id,
                comment: this.state.newComment.trim()
            };
            axios.post(`${config.baseURL}/api/activity-add-comments`, postData, {
                headers: {
                    token: localStorage.getItem("UserToken"),
                }
            })
                .then(res => {
                    if (res.data.code === 200) {
                        this.props.AddNewComment(res.data.data);
                        this.setState({
                            comments: JSON.parse(res.data.data.comments),
                            newComment: ''
                        });
                    }
                })
                .catch(ErrorController)
        }
    }

    render() {
        if (!this.props.activeCard || Object.keys(this.props.activeCard).length <= 0) {
            return null;
        }
        return (
            <div>
                <div className="col-md-12" style={{margin: '0', width: '100%'}}>
                    <div className="row">
                        <div onClick={() => this.props.history.push({pathname: '/my-activity'})}
                             className="close">{'<'}</div>
                    </div>
                </div>
                <EditActivityDetail
                    cardDetail={this.props.activeCard}
                    diffStartDateTime={this.state.diffStartDateTime}
                    attachments={this.state.attachments}
                    comments={this.state.comments}
                    newComment={this.state.newComment}
                    onChangeCommentHandler={this.onChangeCommentHandler}
                    postComment={this.postComment}
                /><br/><br/>
                <Card>
                    <CardContent style={{padding: '0'}}>
                        <div className="row col-md-12"
                             style={{backgroundColor: '#43425d', height: '50px', margin: '0'}}>
                            <div className="acceptTitle"><u>Proposals({this.props.activeCard.accepts.length})</u></div>
                        </div>
                    </CardContent>
                    {
                        this.props.activeCard.accepts.length > 0
                        && this.props.activeCard.accepts.map(acceptedData =>
                            <AcceptList
                                key={acceptedData.id}
                                acceptedData={acceptedData}
                                activityId={this.props.activeCard.id}
                                toggle={this.toggle}
                            />
                        )
                    }
                </Card>
            </div>
        )
    }
}

const mapStateToProps = ({MyActivityStates}) => {
    return {
        activeCard: MyActivityStates.myActivities.activeCard
    }
};
const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        AddNewComment: Actions.AddNewComment
    }, dispatch);
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewActivityDetail));