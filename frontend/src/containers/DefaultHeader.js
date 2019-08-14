import React, {Component} from 'react';
import {Badge, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink} from 'reactstrap';
import PropTypes from 'prop-types';

import {AppHeaderDropdown} from '@coreui/react';
import config from '../config';

const propTypes = {
    children: PropTypes.node,
};

let timeTracking;

class DefaultHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currDate: ''
        };
        this.logout = this.logout.bind(this)
    }

    componentDidMount() {
        const _this = this;
        timeTracking = setInterval(() => {
            const currDate = new Date();
            _this.setState({
                currDate
            })
        }, 1000);
    }

    logout(e) {
        clearInterval(timeTracking);
        this.props.onLogout(e);
    }

    render(thisArg, ...argArray) {
        const UserInfo = localStorage.getItem('UserInfo') && localStorage.getItem('UserInfo') !== undefined && JSON.parse(localStorage.getItem('UserInfo'));
        const fullName = UserInfo && (UserInfo.firstName + ' ' + UserInfo.lastName);
        return (
            <React.Fragment>
                <span
                    style={{marginLeft: '50px'}}>{this.state.currDate.toLocaleString()}</span>
                <Nav className="ml-auto" navbar>
                    <NavItem className="d-md-down-none">
                        <NavLink href="#"><i className="fa fa-arrow-up"/>
                            <Badge color="warning">1</Badge><br/>
                            Ask
                        </NavLink>
                    </NavItem>
                    <NavItem className="d-md-down-none">
                        <NavLink href="#"><i className="fa fa-arrow-down"/>
                            <Badge pill color="warning">1</Badge><br/>
                            Offer
                        </NavLink>
                    </NavItem>
                    <NavItem className="d-md-down-none" style={{marginRight: '10px'}}>
                        <NavLink href="#">
                            <i className="fa fa-volume-up"/>
                            <Badge pill color="warning">1</Badge><br/>
                            Announce
                        </NavLink>
                    </NavItem>
                    <NavItem className="d-md-down-none" style={{marginRight: '10px', marginLeft: '10px'}}>
                        <NavLink href="#">
                            <i className="fa fa-bell"/>
                            <Badge pill color="warning">5</Badge>
                        </NavLink>
                    </NavItem>
                    |
                    <span style={{marginLeft: '10px'}}>{fullName && fullName}</span>
                    <AppHeaderDropdown
                        direction="down">
                        <DropdownToggle nav>
                            <img src={require('../assets/Barrera.jpg')} className="img-avatar"
                                 alt="user"/>
                        </DropdownToggle>
                        <DropdownMenu right style={{right: 'auto', width: '250px'}}>
                            <DropdownItem><i className="fa fa-link"/> <b>Status : </b>&nbsp; Online</DropdownItem>
                            {
                                UserInfo && !UserInfo.communities.find(community => community.role === config.userType.SUPER_ADMIN)
                                && <DropdownItem
                                    onClick={() => this.props.toggle(true)}><i className="fa fa-check"/>
                                    Join to New Community</DropdownItem>
                            }
                            <DropdownItem><i className="fa fa-cog"/> Account Setting</DropdownItem>
                            <DropdownItem><i className="fa fa-pen"/> Feedback</DropdownItem>
                            <DropdownItem
                                onClick={e => this.logout(e)}><i className="fa fa-lock"/> Logout</DropdownItem>
                        </DropdownMenu>
                    </AppHeaderDropdown>
                </Nav>
            </React.Fragment>
        );
    }
}

DefaultHeader.propTypes = propTypes;
export default DefaultHeader;
