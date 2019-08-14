import React from 'react';

const Slide = (props) => (
    <div style={{height: '100%'}}>
        {
            props.componentIndex === 1 ?
                <FirstSlide/>
                : <SecondSlide/>
        }
    </div>
);

const FirstSlide = () => (
    <div className="rootStyle">
        <img
            alt="logo"
            className="img-responsive image1"
            src='http://www.icons101.com/icon_png/size_256/id_79394/youtube.png'
        />
        <h1 style={{color: '#3f3f3f'}}><b>Welcome to AngelHosts</b></h1>
        <h3 style={{color: '#898989'}}>An awesome solution for community engagement</h3>
    </div>
);

class SecondSlide extends React.Component {
    render() {
        return (
            <div className="rootStyle">
                <div style={{height: '15%', position: 'relative', marginBottom: '3%'}}>
                    <img
                        alt="secLogo"
                        className="img-responsive image2"
                        src='http://www.icons101.com/icon_png/size_256/id_79394/youtube.png'
                    />
                    <h1 className="secondTitle">Community</h1>
                </div>
                <div className="comment">
                    <div style={{marginBottom: '2%'}}>Welcome to our community website,</div>
                    <div>Here it is our community dedicated place to:</div>
                    <div><span>ASK</span> for help, for goods/donations,<br/>
                        Buy from our community members/businesses or look for volunteers.
                    </div>
                    <div><span>Offer </span>help, giveaways, sell goods or provide services by our
                        community members, organise or volunteer.
                    </div>
                    <div><span>Announce </span>about , happy, sad, an emergency or celebrations
                        of our Community members.
                    </div>
                    <div style={{margin: '2% 0'}}>Its a perfect place to get to know your community members, network,
                        get involved and enjoy a thriving community
                    </div>
                </div>
                <div className="start">Great! Let's Start now</div>
            </div>
        )
    }
}

export default Slide;
