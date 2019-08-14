import React from "react";
import config from '../../../config';
import {Announcement, ThumbsUpDown, Share, WifiTethering} from '@material-ui/icons';

const COLUMN_TYPE = config.columnType;

export class Column extends React.Component {
    constructor() {
        super();
        this.showPostDetail = this.showPostDetail.bind(this);
        this.showMore = this.showMore.bind(this);
    }

    showPostDetail(index) {
        this.props.changeActivityType(index);
    }

    showMore() {
        this.props.showItemsHandler(!this.props.expanded, this.props.id);
    }

    render() {
        let columnIcon;
        switch (this.props.id) {
            case COLUMN_TYPE.ASK_OFFER:
                columnIcon = <ThumbsUpDown fontSize="large"/>;
                break;
            case COLUMN_TYPE.ANNOUNCE:
                columnIcon = <Announcement fontSize="large"/>;
                break;
            case COLUMN_TYPE.SHARED_STORIES:
                columnIcon = <Share fontSize="large"/>;
                break;
            case COLUMN_TYPE.EMERGENCY:
                columnIcon = <WifiTethering fontSize="large"/>;
                break;
            default:
                columnIcon = <ThumbsUpDown fontSize="large"/>;
        }
        return (
            <div className="col-md-3 Column_container">
                <div className={"Column_" + this.props.id}>
                    <div className="Column_child">
                        {
                            this.props.id !== COLUMN_TYPE.EMERGENCY ?
                                <div className="circle" onClick={() => this.showPostDetail(this.props.id)}>
                                    <img
                                        className="addbtnimg"
                                        src="https://ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_speeddial_white_24dp_2x.png"
                                        alt=""
                                    />
                                </div> : null
                        }
                    </div>
                    <div>
                        <div style={{margin: '10px 0'}}>
                            {/*<button type="button" style={{backgroundColor: "#3434e8a8",color: "white"}} className="btn btn-primary btn-circle btn-xl"><i className="fa fa-plus"/></button>*/}
                            {columnIcon}&nbsp;&nbsp;
                            <span className="Column__title">{this.props.title}</span>
                        </div>
                        {this.props.children}
                        {/*<TextForm onSubmit={props.addCard} placeholder="Add card..."/>*/}
                    </div>
                    <br/>
                    {
                        this.props.numCards > 5 ?
                            <button
                                className="btn btn-primary showMore"
                                onClick={this.showMore}
                            >
                                {this.props.expanded ? (
                                    <span>Show less</span>
                                ) : (
                                    <span>Show more</span>
                                )}
                            </button> : null
                    }
                </div>

            </div>
        );
    }
}
