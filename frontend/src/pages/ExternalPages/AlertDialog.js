import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Warning from "@material-ui/core/es/internal/svg-icons/Warning";

class AlertDialog extends React.Component {
    handleClose = (isAgree) => {
        this.props.handleClose(!this.props.open, isAgree, this.props.action)
    };

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title"><Warning style={{color: 'red'}}/>{this.props.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {this.props.description}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.handleClose(false)} color="primary">
                        Disagree
                    </Button>
                    <Button onClick={() => this.handleClose(true)} color="primary" autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default AlertDialog;