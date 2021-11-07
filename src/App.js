import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import {useEffect, useState} from "react";

// Constants
const TWITTER_HANDLE = '0xcmrnk';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// Test GIFs!
const TEST_GIFS = [
    "https://c.tenor.com/0GeY2LNQNoYAAAAC/jerma-jerma985.gif",
    "https://c.tenor.com/sZY-AkBVEoMAAAAC/jerma-speen.gif",
    "https://c.tenor.com/Y4sE1nGvRtEAAAAd/jerma.gif",
    "https://c.tenor.com/fQG-_22KG4EAAAAM/jerma985-clown.gif",
    "https://c.tenor.com/ha7Ob_ptjaYAAAAd/jerma-fast.gif",
    "https://c.tenor.com/GINKuAQ6JDUAAAAC/jerma-jerma985.gif"
]

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

  const renderConnectedContainer = () => (
      <div className="connected-container">
        <div className="gif-grid">
          {TEST_GIFS.map(gif => (
              <div className="gif-item" key={gif}>
                <img src={gif} alt={gif} />
              </div>
          ))}
        </div>
      </div>
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
          <p className="header">🖼 Meme GIF Station</p>
          <p className="sub-text">
            Check out the decentralized meme space ✨ 🌐 🌆
          </p>
          {/* This only shows if we don't have a wallet address */}
          {!walletAddress && renderNotConnectedContainer()}
            {/* This shows if we do have a wallet address and are connected */}
            {walletAddress && renderConnectedContainer()}
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
