import React from 'react';
import CryptoDetailPanel from '../../component/CryptoDetailPanel';
import './MainPage.sass';
import CryptoNewsPanel from '../../component/CryptoNewsPanel/CryptoNewsPanel';
import { getBitcoinNews } from '../../api/news.api';
import io from 'socket.io-client';
import GoogleLogin from 'react-google-login';
import CryptoLike from '../../component/CryptoLike';
import { connect } from 'react-redux';
import { loadCryptoPrice } from '../../actions/crypto';
import { loadGif } from '../../actions/gif';
import PropTypes from 'prop-types';
import { loadLikesCount, loadIsGifLiked } from '../../actions/like/index';
import { loadAuthUser } from '../../actions/auth/index';

let socket = io(`${process.env.API_URL}/likes`);

class MainPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      news: []
    };
  }

  toggleLike = () => {
    if (!this.props.authUser) {
      alert('You have to sign in with Google.');
      return;
    }
    const like = { email: this.props.authUser.email, gif: this.state.gif };
    if (this.props.isGifLiked) {
      socket.emit('removeLike', like);
    } else {
      socket.emit('newLike', like);
    }
  }

  loadBitcoinPrice() {
    this.props.dispatch(loadCryptoPrice())
      .then(({ percentChange }) => {
        this.props.dispatch(loadGif(percentChange))
          .then(gif => {
            this.props.dispatch(loadLikesCount(gif));
            if (this.props.authUser) {
              this.props.dispatch(loadIsGifLiked(this.props.authUser.email, gif));
            }
          });
      });
  }

  loadBitcoinNews() {
    getBitcoinNews()
      .then(data => {
        this.setState({
          news: data.articles
        });
      });
  }

  componentDidMount() {
    socket.on('connect', () => {

    });

    socket.on('addLike', () => {
      this.loadLikes(this.props.gif);
    });

    socket.on('reduceLike', () => {
      this.loadLikes(this.props.gif);
    });

    this.loadBitcoinPrice();
    this.loadBitcoinNews();

    setTimeout(() => {
    }, 1000);
  }

  responseGoogle(response) {
    if (!response.profileObj) return;

    const authUser = {
      email: response.profileObj.email,
      name: response.profileObj.name
    };

    localStorage.setItem('authUser', JSON.stringify(authUser));
    this.props.dispatch(loadAuthUser(authUser))
      .then(() => {
        this.props.dispatch(loadIsGifLiked(authUser.email, this.props.gif));
      });
  }

  render() {
    return (
      <div className="main-page">
        <CryptoDetailPanel {...this.props.cryptoPrice}/>
        <br/>
        <div className="gif-meme">
          <div className="google-signin">
            { !this.props.authUser ?
              <GoogleLogin
                id="googleBtn"
                ref={(ref) => this.googleBtn = ref}
                clientId="329817704445-rl1r1738d0n99f73nf32nka6trlh5og2"
                onSuccess={this.responseGoogle.bind(this)}>
                <i className="fab fa-google"></i> <span>Login with Google</span>
              </GoogleLogin> :
              <div>Welcome, {this.props.authUser.name}</div>
            }

          </div>

          <div className="gif-img">
            { this.props.gif ? <img src={`${process.env.API_URL}/gifs/${this.props.gif}`}/> : null }
          </div>

          <br/>

          <CryptoLike isGifLiked={this.props.isGifLiked} likeCount={this.props.likeCount} toggleLike={this.toggleLike}/>
        </div>
        <br/>
        <CryptoNewsPanel news={this.state.news}/>
      </div>
    );
  }
}

MainPage.propTypes = {
  dispatch: PropTypes.func,
  cryptoPrice: PropTypes.object,
  gif: PropTypes.string,
  isGifLiked: PropTypes.bool,
  likeCount: PropTypes.number,
  authUser: PropTypes.object
};

function mapStateToProps(state) {
  return {
    selectedCrypto: state.crypto.selectedCrypto,
    cryptoPrice: state.crypto.cryptoPrice,
    gif: state.gif,
    isGifLiked: state.like.isGifLiked,
    likeCount: state.like.count,
    authUser: state.auth
  };
}

export default connect(mapStateToProps, )(MainPage);