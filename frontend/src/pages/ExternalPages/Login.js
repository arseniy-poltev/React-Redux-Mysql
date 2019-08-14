import React, {Component} from "react";
import axios from "axios";
import {
    NotificationContainer,
    NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import {Card, CardBody, CardGroup, Col, Row, Modal, ModalBody, ModalHeader} from "reactstrap";
import {withRouter} from 'react-router-dom';
import "./assets/styles.css";
import OnEvent from 'react-onevent';
import {disableBodyScroll} from 'body-scroll-lock';
import config from '../../config';
import {ErrorController} from "../../containers/ErrorController";
import {Button} from '@material-ui/core';
import LoadingScreen from "../../containers/Loading/LoadingScreen";

class Login extends Component {
    targetElement = null;

    constructor(props) {
        super(props);
        localStorage.clear();
        this.state = {
            errors: false,
            forgetPsw: {
                email: ""
            },
            login: {
                email: "",
                password: ""
            },
            isOpenForgotPasswordPage: false,
            isLoading: false
        };
        this.onChange = this.onChange.bind(this);
        this.onForgetPswChange = this.onForgetPswChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onForgetPswSubmit = this.onForgetPswSubmit.bind(this);
        this.newUser = this.newUser.bind(this);
        this.toggleForgotPasswordPage = this.toggleForgotPasswordPage.bind(this)
    }

    componentDidMount() {
        localStorage.clear();
        this.targetElement = document.querySelector('#login');
        disableBodyScroll(this.targetElement);
    }

    newUser() {
        this.props.history.push("/register");
    }

    onChange(e) {
        let login = this.state.login;
        login[e.target.name] = e.target.value;
        this.setState({login});
    }

    onForgetPswChange(e) {
        let email = this.state.forgetPsw;
        email[e.target.name] = e.target.value;
        this.setState({email});
    }

    onForgetPswSubmit(e) {
        e.preventDefault();
        const forgetPsw = this.state.forgetPsw;
        var _this = this;
        this.setState({
            errors: true,
            isLoading: true
        });
        axios.post(`${config.baseURL}/api/auth/forgot-password`, forgetPsw).then(res => {
            _this.setState({
                errors: false,
                isLoading: false
            });
            if (res.data.code === 200) {
                NotificationManager.success(res.data.message);
            } else {
                NotificationManager.error(res.data.message);
            }
        }).catch(error=>{
            _this.setState({
                isLoading: false
            });
            ErrorController(error)
        });
    }

    onSubmit(e) {
        var _this = this;
        const loginUser = this.state.login;
        this.setState({errors: true});
        axios.post(`${config.baseURL}/api/auth/login`, loginUser).then(res => {
            _this.setState({errors: false});
            if (res.data.code === 200) {
                localStorage.setItem("UserInfo", JSON.stringify(res.data.data));
                localStorage.setItem("UserToken", JSON.stringify(res.data.token));
                _this.setState({
                    login: {},
                }, () => {
                    _this.props.history.push("/");
                });
            } else {
                NotificationManager.error(res.data.message);
            }
        }).catch(ErrorController);
    }

    toggleForgotPasswordPage() {
        this.setState(prevState => ({
            isOpenForgotPasswordPage: !prevState.isOpenForgotPasswordPage
        }))
    }

    render() {
        return (
            <div>
                <Row id="login" className="justify-content-center"
                     style={{marginLeft: "0", marginRight: "0"}}>
                    <Col md="12" style={{paddingLeft: "0", paddingRight: "0", width: '100%'}}>
                        <CardGroup>
                            <Card
                                className="text-white d-md-down-none"
                            >
                                <img
                                    alt=""
                                    src={require('./assets/background.png')}
                                    style={{
                                        backgroundPosition: "center center",
                                        backgroundRepeat: "no-repeat",
                                        height: "100vh"
                                    }}
                                />
                            </Card>
                            <Card className="p-4">
                                <div className="respLogin">
                                    <CardBody>
                                        <h1 className="text-center">
                                            <strong>A n g e l H o s t s</strong>
                                        </h1>
                                        <p className="text-muted text-center">
                                            Sign In to your account
                                        </p>
                                        <OnEvent enter={this.onSubmit}>
                                            <div className="form-group bmd-form-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{border: "none"}}
                                                    id="email"
                                                    name="email"
                                                    placeholder="Email Id"
                                                    // value={this.state.login.email}
                                                    onChange={this.onChange}
                                                />
                                            </div>
                                        </OnEvent>
                                        <OnEvent enter={this.onSubmit}>
                                            <div className="form-group bmd-form-group">
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    style={{border: "none"}}
                                                    id="password"
                                                    name="password"
                                                    placeholder="Password"
                                                    // value={this.state.login.password}
                                                    onChange={this.onChange}
                                                />
                                            </div>
                                        </OnEvent>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <button
                                                    type="button"
                                                    style={{background: "#564179", color: "white"}}
                                                    className="btn btn-block btn-raised"
                                                    onClick={this.onSubmit}
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        </div>
                                        <br/>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <p className="text-muted text-center">

                                                    <Button
                                                        variant="text"
                                                        onClick={this.toggleForgotPasswordPage}
                                                        className="text-muted text-center"
                                                    >
                                                        <u>Forgot password?</u>
                                                    </Button>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <p className="text-muted text-center">
                                                    Don't have an account ?
                                                    <a
                                                        href="#register"
                                                        style={{cursor: "pointer", color: "blue"}}
                                                        onClick={this.newUser}>
                                                        {" "}
                                                        <u>Register</u>
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </div>
                            </Card>
                        </CardGroup>
                    </Col>
                    <NotificationContainer/>
                </Row>
                {
                    this.state.isOpenForgotPasswordPage &&
                    <Modal
                        isOpen={this.state.isOpenForgotPasswordPage}
                        toggle={this.toggleForgotPasswordPage}>
                        <ModalHeader toggle={this.toggleForgotPasswordPage}>
                            Forgot Password?
                        </ModalHeader>
                        <ModalBody>
                            <form onSubmit={this.onForgetPswSubmit}>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="forgotPass"
                                        placeholder="Email Address"
                                        name="email"
                                        value={this.state.forgetPsw.email}
                                        onChange={this.onForgetPswChange}
                                        style={{border: "none"}}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    style={{background: "#564179", color: "white"}}
                                    className="btn btn-block btn-raised"
                                >
                                    Reset Password
                                </button>
                            </form>
                        </ModalBody>
                        <LoadingScreen isLoading={this.state.isLoading}/>
                    </Modal>
                }
            </div>
        );
    }
}

export default withRouter(Login);
