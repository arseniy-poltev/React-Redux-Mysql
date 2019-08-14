import React from 'react';
import {Button} from "reactstrap";
import {withRouter} from 'react-router-dom';
import PostModal from "./PostModal/index";
import config from "../../../../config";

const ACTIVITY_TYPE = config.activityType;

class BoardHeader extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="col-md-9">
                    <div className="flex-row flex-sm-nowrap card">
                        <div className="card-body">
                            <div className="row" style={{color: '#ababb7', fontSize: '1.2em'}}>
                                <div className="col-md-4">
                                    <p>What would you like to do?</p>
                                </div>
                                <div className="col-md-8">
                                    <div className="custom-control custom-radio custom-control-inline">
                                        <input
                                            readOnly={true}
                                            checked={
                                                this.props.activityType === ACTIVITY_TYPE.ASK
                                                || this.props.activityType === ACTIVITY_TYPE.OFFER
                                            }
                                            type="radio"
                                            className="custom-control-input"
                                            name="opt-radio"
                                            onClick={() => this.props.onOptionClickHandler(ACTIVITY_TYPE.ASK)}
                                            id="opt-radio1"
                                            value={ACTIVITY_TYPE.ASK}
                                        />
                                        <label className="custom-control-label" htmlFor="opt-radio1">
                                            Ask for/Offer
                                        </label>
                                    </div>
                                    <div className="custom-control custom-radio custom-control-inline">
                                        <input
                                            readOnly={true}
                                            checked={this.props.activityType === ACTIVITY_TYPE.ANNOUNCE}
                                            type="radio"
                                            className="custom-control-input"
                                            id="opt-radio2"
                                            onClick={() => this.props.onOptionClickHandler(ACTIVITY_TYPE.ANNOUNCE)}
                                            name="opt-radio"
                                            value={ACTIVITY_TYPE.ANNOUNCE}
                                        />
                                        <label className="custom-control-label" htmlFor="opt-radio2">
                                            Announce
                                        </label>
                                    </div>
                                    <div className="custom-control custom-radio custom-control-inline">
                                        <input
                                            readOnly={true}
                                            checked={this.props.activityType === ACTIVITY_TYPE.SHARED_STORIES}
                                            type="radio"
                                            name="opt-radio"
                                            id="opt-radio3"
                                            onClick={() => this.props.onOptionClickHandler(ACTIVITY_TYPE.SHARED_STORIES)}
                                            className="custom-control-input"
                                            value={ACTIVITY_TYPE.SHARED_STORIES}
                                        />
                                        <label className="custom-control-label" htmlFor="opt-radio3">
                                            Share Story
                                        </label>
                                    </div>
                                    <div className="custom-control custom-radio custom-control-inline">
                                        <input
                                            type="radio"
                                            name="opt-radio"
                                            id="opt-radio4"
                                            onClick={() => this.props.onOptionClickHandler(ACTIVITY_TYPE.SEARCH)}
                                            className="custom-control-input"
                                            value={ACTIVITY_TYPE.SEARCH}
                                        />
                                        <label className="custom-control-label" htmlFor="opt-radio4">
                                            Search
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="input-group col-md-12">
                                    <input
                                        onKeyPress={this.props.onSending}
                                        onChange={this.props.onChangeTitleHandler}
                                        autoComplete="off"
                                        className="form-control nofocus"
                                        placeholder={this.props.inputPlaceHolder}
                                        id="title"
                                        value={this.props.title}
                                        ref={c => this.textInput = c}
                                    />
                                    <Button
                                        inline="true"
                                        color="primary"
                                        style={{color: 'white'}}
                                        onClick={this.props.togglePostModal}>Post</Button>
                                    {
                                        this.props.showPostModal ?
                                            <PostModal
                                                isOpen={this.props.showPostModal}
                                                title={this.props.title}
                                                activityType={this.props.activityType}
                                                toggleModal={this.props.togglePostModal}
                                                addCard={this.props.addCard}
                                                communityId={this.props.match.params.communityId}
                                            /> : null
                                    }
                                </div>
                            </div>
                            <div className="row" style={{margin: '10px', fontSize: '#696b76'}}>
                                Example, you can ask volunteers, buy goods or services, get
                                give-aways, baby-sitters, help with something, taking part in
                                activities and much more
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="flex-row flex-sm-nowrap card">
                        <div style={{position: 'absolute', top: 0, right: 0}}>
                            <button type="button" className="btn btn-ghost-dark">&times;</button>
                        </div>
                        <div className="card-body">
                            <div style={{color: '#707198', fontSize: '1.5em', marginBottom: '20px'}}>
                                Banner Ad Side
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <img
                                        alt="avatar"
                                        style={{
                                            borderRadius: '50%',
                                            width: '100%',
                                            maxHeight: '100px',
                                            marginTop: '10%'
                                        }}
                                        src={require('../../../../assets/Barrera.jpg')}/>
                                </div>
                                <div style={{display: 'inline-block'}} className="col-md-8">
                                    <div style={{fontSize: '1.5em', fontWeight: 'bold', color: '#4d4f5c'}}>Benjy
                                        Katz
                                    </div>
                                    <div style={{fontSize: '1.2em', color: '#a1a0ae'}}>
                                        Buseness Lawyer<br/>
                                        Mobile : 871.567.4877
                                    </div>
                                    <div style={{fontSize: '1em', color: '#c5c5cd'}}>2 Asks | 4 offers</div>
                                </div>
                            </div>
                            <hr/>
                            <div style={{width: '100%'}}>
                                <div style={{width: '30%', display: 'inline-block'}}>
                                    <img
                                        alt="imgInstagram"
                                        className="img-responsive"
                                        style={{width: '20%', padding: '0 3%'}}
                                        src={require('../../../../assets/social/instagram.png')}/>
                                    <img
                                        alt="imgTwitter"
                                        className="img-responsive"
                                        style={{width: '20%', padding: '0 3%'}}
                                        src={require('../../../../assets/social/twitter.png')}/>
                                    <img
                                        alt="imgFacebook"
                                        className="img-responsive"
                                        style={{width: '20%', padding: '0 3%'}}
                                        src={require('../../../../assets/social/fecebook.png')}/>
                                    <img
                                        alt="imgMail"
                                        className="img-responsive"
                                        style={{width: '20%', padding: '0 3%'}}
                                        src={require('../../../../assets/social/mail.png')}/>
                                    <img
                                        alt="imgLinkedin"
                                        className="img-responsive"
                                        style={{width: '20%', padding: '0 3%', marginBottom: '3px'}}
                                        src={require('../../../../assets/social/linkedin.png')}/>
                                </div>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <span style={{
                                    fontSize: '0.8em',
                                    display: 'inline-block',
                                    color: '#575965'
                                }}>Add to my Contacts</span>&nbsp;&nbsp;&nbsp;&nbsp;
                                <span style={{
                                    fontSize: '0.8em',
                                    display: 'inline-block',
                                    color: '#4a8fff',
                                    cursor:'pointer'
                                }}
                                >Read more</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )

    }
}

export default withRouter(BoardHeader)