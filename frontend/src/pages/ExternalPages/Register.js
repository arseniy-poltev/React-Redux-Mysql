import React, {Component} from "react";
import axios from "axios";
import {
    NotificationContainer,
    NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import {disableBodyScroll} from 'body-scroll-lock';
import "./assets/styles.css";
import {withRouter} from 'react-router-dom';
import {
    Card,
    CardBody,
    CardGroup,
    Col,
    Row
} from "reactstrap";
import config from '../../config';
import {ErrorController} from "../../containers/ErrorController";


class Register extends Component {
    targetElement = null;

    constructor() {
        super();
        this.state = {
            isActive: false,
            errors: false,
            c_password: "",
            registration: {
                firstName: "",
                lastName: "",
                userName: "",
                email: "",
                password: ""
            }
        };
        this.onConfirmPass = this.onConfirmPass.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.existingUser = this.existingUser.bind(this);
    }

    componentDidMount() {
        const search = this.props.location.search;
        const params = new URLSearchParams(search);
        const email = params.get('email');
        if (email) {
            let registration = this.state.registration;
            registration['email'] = email;
            this.setState({registration});
        }
    }

    onConfirmPass(e) {
        let c_password = this.state.c_password;
        c_password = e.target.value;
        this.setState({c_password});
    }

    onChange(e) {
        let registration = this.state.registration;
        registration[e.target.name] = e.target.value;
        this.setState({registration});
    }

    existingUser() {
        this.props.history.push("/login");
    }

    onSubmit(e) {
        e.preventDefault();
        const newUser = this.state.registration;
        const _this = this;
        this.setState({errors: true});
        axios.post(`${config.baseURL}/api/auth/user-register`, newUser).then(res => {
            _this.setState({errors: false});
            if (res.data.code === 200) {
                NotificationManager.success(res.data.message);
                _this.refs.form.reset();
                setTimeout(function () {
                    _this.props.history.push("/login");
                }, 2000);
            } else {
                NotificationManager.error(res.data.message);
            }
        }).catch(ErrorController);
    }

    render() {
        this.targetElement = document.querySelector('#register');
        disableBodyScroll(this.targetElement);
        return (
            <Row id="register" className="justify-content-center m-auto"
                 style={{marginLeft: "0", marginRight: "0", overflowX: "hidden"}}>
                <Col md="12" style={{paddingLeft: "0", paddingRight: "0"}}>
                    <CardGroup>
                        <Card
                            className="text-white d-md-down-none"
                            style={{width: "44%"}}>
                            <img
                                alt="background"
                                src={require('./assets/background.png')}
                                style={{
                                    backgroundPosition: "center center",
                                    backgroundRepeat: "no-repeat",
                                    height: "100vh"
                                }}
                            />
                            {/*<div className="title">Community</div>*/}
                        </Card>
                        <Card className="p-4">
                            <CardBody className="m-auto">
                                <h1 className="text-center">
                                    <strong>A n g e l H o s t s</strong>
                                </h1>
                                <p className="text-muted text-center">
                                    Please complete to create your account.
                                </p>
                                <form onSubmit={this.onSubmit} ref="form">
                                    <div className="row">
                                        <div className="col">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="First name"
                                                style={{border: "none"}}
                                                name="firstName"
                                                value={this.state.registration.firstName}
                                                onChange={this.onChange}
                                                required
                                            />
                                        </div>
                                        <div className="col">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Last name"
                                                style={{border: "none"}}
                                                name="lastName"
                                                value={this.state.registration.lastName}
                                                onChange={this.onChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group bmd-form-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{border: "none"}}
                                            placeholder="Username"
                                            id="userName"
                                            name="userName"
                                            value={this.state.registration.userName}
                                            onChange={this.onChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group bmd-form-group">
                                        <input
                                            type="email"
                                            className="form-control"
                                            style={{border: "none"}}
                                            placeholder="Email"
                                            id="email"
                                            name="email"
                                            value={this.state.registration.email}
                                            onChange={this.onChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group bmd-form-group">
                                        <input
                                            type="password"
                                            className="form-control"
                                            style={{border: "none"}}
                                            placeholder="Password"
                                            id="password"
                                            name="password"
                                            value={this.state.registration.password}
                                            onChange={this.onChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group bmd-form-group">
                    <span
                        className={
                            this.state.c_password &&
                            this.state.registration.password &&
                            this.state.registration.password === this.state.c_password
                                ? "succes"
                                : "err"
                        }>
                      {this.state.c_password &&
                      this.state.registration.password &&
                      this.state.registration.password !== this.state.c_password
                          ? "Password and Confirm Password didn't match."
                          : ""}
                    </span>
                                        <input
                                            type="password"
                                            className="form-control"
                                            style={{border: "none"}}
                                            placeholder="Confirm Password"
                                            id="cPassword"
                                            name="c_password"
                                            value={this.state.c_password}
                                            onChange={this.onConfirmPass}
                                            required
                                        />
                                    </div>
                                    <div className="custom-control custom-checkbox my-1 mr-sm-2">
                                        <input
                                            className="custom-control-input"
                                            type="checkbox"
                                            name="terms"
                                            value={this.state.isActive}
                                            id="defaultCheck1"
                                            onChange={e => {
                                                this.setState({isActive: !this.state.isActive});
                                            }}
                                            // checked={this.state.isActive}
                                        />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="defaultCheck1">
                                            I agree with terms and conditions
                                        </label>
                                    </div>
                                    <div className="form-group bmd-form-group text-center">
                                        <button
                                            type="submit"
                                            className="btn btn-md active btn-raised"
                                            style={{
                                                background: "#564179",
                                                color: "white",
                                                width: "40%"
                                            }}
                                            aria-pressed="true"
                                            disabled={
                                                !this.state.isActive ||
                                                this.state.registration.password !== this.state.c_password
                                            }
                                        >
                                            {this.state.errors ? (
                                                <React.Fragment>
                          <span>
                            <i className="fa fa-spinner fa-spin"/>
                          </span>{" "}
                                                    Loading...
                                                </React.Fragment>
                                            ) : (
                                                "Signup"
                                            )}
                                        </button>
                                    </div>
                                    <div className="form-group text-center">
                                        <a
                                            style={{cursor: "pointer"}}
                                            onClick={this.existingUser}
                                            className="text-muted"
                                            href="#login"
                                        >
                                            <u>Already have an account? Sign in.</u>
                                        </a>
                                    </div>
                                </form>
                                <p className="text-muted text-center mt-5">
                                    <small>Term of use. Privacy policy</small>
                                </p>
                            </CardBody>
                        </Card>
                    </CardGroup>
                </Col>
                <NotificationContainer/>
            </Row>
        );
    }
}

export default withRouter(Register);
