import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import {useEffect, useState} from "react";

// Constants
const TWITTER_HANDLE = '0xcmrnk';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  // State
  const [walletAddress, setWalletAddrress] = useState(null);
  // Actions
  /* Is Phantom wallet connected? */
  const checkPhantomWalletConnection = async () => {
    try {
      const {solana} = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Huzzah! Phantom wallet detected');
          /* solana object contains a function that allows us to connect to the user's Phantom wallet */
          const response = await solana.connect({onlyIfTrusted: true});
          console.log('Connected with PK:', response.publicKey.toString());
          /* Set user's pK in state to be saved & used later on */
          setWalletAddrress(response.publicKey.toString());
        }
      } else {
        alert('BOO! 👻 Solana object not found. Install Phantom wallet from your nearest extension store.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* Performs connection authorization with Phantom */
  const connectWallet = async () => {
    const {solana} = window;
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with pK:', response.publicKey.toString());
      setWalletAddrress(response.publicKey.toString());
    }
  };

  /* User hasn't connected wallet yet */
  const renderNotConnectedContainer = () => (
      <button
        className="cta-button connect-wallet-button"
        onClick={connectWallet}
        >
        Connect your Phantom Wallet
      </button>
  );

  // UseEffects
  /* Once component mounts, wait for Phantom wallet connection */
  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkPhantomWalletConnection();
    });
  }, []);

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your awesome GIF collection in the metaverse! ✨ 🌐 🌆
          </p>
          {/* This only shows if we don't have a wallet address */}
          {!walletAddress && renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE} with help from buildspace`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
