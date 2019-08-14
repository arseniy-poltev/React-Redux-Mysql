import React from 'react';
import {AutoRotatingCarousel} from 'material-auto-rotating-carousel';
import Slide from './Slide';
import './styles.css';
class WelcomeModals extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false
    };
    this.setVisited = this.setVisited.bind(this);
  }

  componentDidMount() {
    if (localStorage.getItem('visited')) {
      this.setState({
        open: false
      })
    } else {
      this.setState({
        open: true
      })
    }
  }

  setVisited() {
    localStorage.setItem('visited', true);
    this.setState({
      open: false
    })
  }

  render() {
    return (
      <div style={{position: 'relative', width: '100%', height: 500, display:'none'}}>
        <AutoRotatingCarousel
          label='Get started'
          autoplay={false}
          open={this.state.open}
          onClose={() => this.setState({open: true})}
          onStart={() => this.setVisited()}
          style={{position: 'absolute'}}>
          <Slide componentIndex={1}/>
          <Slide componentIndex={2}/>
        </AutoRotatingCarousel>
      </div>
    )
  }
}

export default WelcomeModals;
