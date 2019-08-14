import React, {Component} from 'react';
import axios from 'axios';
import Board from './Board/index';
import './styles.css';
import config from "../../../config";
import {bindActionCreators} from "redux";
import * as Actions from "./store/actions";
import {connect} from "react-redux";
import {enableBodyScroll, clearAllBodyScrollLocks} from 'body-scroll-lock';
import {ErrorController} from "../../../containers/ErrorController";
import withReducer from "../../store/withReducer";
import reducer from "./store/reducers";
import {withRouter} from "react-router-dom";

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            targetElements: null
        };
        this.addCard = this.addCard.bind(this);
        this.getAllInfo = this.getAllInfo.bind(this);
    }

    getAllInfo() {
        this.setState({
            targetElements: document.querySelector('#dashboard')
        });
        const _this = this;
        axios.get(`${config.baseURL}/api/activity-paginate/${this.props.match.params.communityId}`, {
            headers: {
                token: localStorage.getItem("UserToken")
            }
        })
            .then(res => {
                if (res.data.code === 200) {
                    localStorage.setItem("UserToken", JSON.stringify(res.data.token));
                    if (res.data.data.length > 0) {
                        _this.props.GetAllActivities(res.data.data);
                    }
                } else {
                    if (res.data.code === 404) {
                        _this.props.RemoveAllActivities();
                    }
                }
            })
            .catch(ErrorController);
    }

    componentWillUnmount() {
        clearAllBodyScrollLocks();
    }

    componentDidMount() {
        this.getAllInfo();
    }

    componentDidUpdate(prevProps, prevState, snapShot) {
        if (prevProps.match.params.communityId !== this.props.match.params.communityId) {
            this.getAllInfo();
        }
    }

    addCard(card) {
        this.props.AddCard(card);
    };

    render() {
        enableBodyScroll(this.state.targetElements);
        return (
            <Board
                addCard={this.addCard}
            />
        );
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        GetAllActivities: Actions.GetAllActivities,
        RemoveAllActivities: Actions.RemoveAllActivities,
        AddCard: Actions.AddCard
    }, dispatch)
};
export default withReducer('DashboardStates', reducer)(withRouter(connect(null, mapDispatchToProps)(Dashboard)));
