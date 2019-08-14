import './@fake-db';
import React, {Component} from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Loadable from 'react-loadable';
import "@coreui/coreui/scss/coreui.scss";
import "./index.css";
import {jssPreset} from '@material-ui/core';
import {create} from 'jss';
import jssExtend from 'jss-extend';

const jss = create({
    ...jssPreset(),
    plugins: [...jssPreset().plugins, jssExtend()]
});

jss.options.insertionPoint = document.getElementById('jss-insertion-point');
const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers
const DefaultLayout = Loadable({
    loader: () => import('./containers/DefaultLayout'),
    loading
});

// Pages
const Login = Loadable({
    loader: () => import('./pages/ExternalPages/Login'),
    loading
});

const Register = Loadable({
    loader: () => import('./pages/ExternalPages/Register'),
    loading
});

const Page404 = Loadable({
    loader: () => import('./pages/ExternalPages/Page404'),
    loading
});

const Page500 = Loadable({
    loader: () => import('./pages/ExternalPages/Page500'),
    loading
});

class App extends Component {

    render() {
        return (
            <div style={{width: '100%'}}>
                <HashRouter>
                    <Switch>
                        <Route exact path="/login" name="Login Page" component={Login}/>
                        <Route exact path="/register" name="Register Page" component={Register}/>
                        <Route exact path="/404" name="Page 404" component={Page404}/>
                        <Route exact path="/500" name="Page 500" component={Page500}/>
                        <Route path="/" name="Home" component={DefaultLayout}/>
                    </Switch>
                </HashRouter>
            </div>
        );
    }
}

export default App;
