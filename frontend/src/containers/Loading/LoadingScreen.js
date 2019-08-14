import React from 'react';
import './styles.css';

export default class LoadingScreen extends React.Component {
    render() {
        return (
            this.props.isLoading ?
                <div className="LoadingScreen animated fadeIn pt-3 text-center" style={{left: 0, top: 0}}>
                    <div style={{width: '100%', height: '100%', position: 'relative'}}>
                        <img
                            alt="loading"
                            className="loading"
                            style={{height: '50%', top: '40%'}}
                            src={require('../../assets/loading/Loading3.gif')}
                        />
                        <div className="loading"
                             style={{fontWeight: 'bold', fontSize: '30px', top: '70%'}}>Loading...
                        </div>
                        <div className="loading"
                             style={
                                 this.props.value > 0
                                     ? {fontWeight: 'bold', fontSize: '30px', top: '80%'}
                                     : {fontWeight: 'bold', fontSize: '30px', top: '80%', visibility: 'hidden'}
                             }>{this.props.value}%
                        </div>
                    </div>
                </div> : null
        )
    }
}
