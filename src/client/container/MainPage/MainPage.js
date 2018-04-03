import React from 'react';
import CryptoDetailPanel from '../../component/CryptoDetailPanel';
import './MainPage.sass';
import { getBitcoinPrice } from '../../api/crypto.api';
import CryptoNewsPanel from '../../component/CryptoNewsPanel/CryptoNewsPanel';
import { getBitcoinNews } from '../../api/news.api';
import io from 'socket.io-client';
let socket = io('http://localhost:3000/likes');

class MainPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      price: '',
      percentChange: '',
      priceChange: '',
      gif: '',
      news: []
    };
  }

  newLike = () => {
    socket.emit('newLike', this.state.gif);
  }

  componentDidMount() {

    socket.on('connect', (data) => {
      console.log('connected', data);
    });

    socket.on('addLike', () => {
      alert('New like');
    });

    getBitcoinPrice()
      .then(bitconPrice => {
        bitconPrice = bitconPrice[0];

        let gif = '';
        const price = Number(bitconPrice.price_usd);
        const percentChange = Number(bitconPrice.percent_change_24h);
        const priceChange = price - (price / ((percentChange / 100) + 1)) ;

        if (percentChange < -10){
          gif = 'crying.gif';
        } else if (-10 <= percentChange && percentChange < -3) {
          gif = 'can_we_panic.gif';
        } else if (-3 <= percentChange && percentChange < 3) {
          gif = 'its_ok.gif';
        } else if (percentChange >= 3) {
          gif = 'getting_excited.gif';
        }

        this.setState({
          price: price.format(2),
          percentChange: percentChange.format(2),
          priceChange: priceChange.format(2),
          gif: gif
        });
      });

    getBitcoinNews()
      .then(data => {
        this.setState({
          news: data.articles
        });
      });
  }

  render() {
    return (
      <div className="main-page">
        <CryptoDetailPanel {...this.state}/>

        <div className="gif-meme">
          { this.state.gif ? <img src={`http://localhost:3000/gifs/${this.state.gif}`}/> : null }
          <br/>
          <br/>
          <label>2,502</label>
          <a href="javascript:void(0)" onClick={this.newLike}><i className="fas fa-heart fa-2x" ></i></a>
        </div>
        <br/>
        <CryptoNewsPanel news={this.state.news}/>
      </div>
    );
  }
}

export default MainPage;