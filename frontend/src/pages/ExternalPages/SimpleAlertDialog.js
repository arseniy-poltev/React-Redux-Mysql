import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {withRouter} from 'react-router-dom';
class SimpleAlertDialog extends React.Component {
    handleClose = () => {
        this.props.showDialog(false);
        localStorage.clear();
        window.location.reload();
    };

    render() {
        return (
            <div>
                <Dialog
                    open={this.props.open}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Error From Server</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {this.props.text}<br/>
                            You Will Get Logged out Soon
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">LOG OUT</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default withRouter(SimpleAlertDialog);