import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import React, {Component, useEffect, useState} from "react";
import {Program, web3, Provider} from "@project-serum/anchor";
import { Connection, PublicKey, clusterApiUrl} from "@solana/web3.js";
import idl from './idl.json';
import kp from './keypair.json'
import { render } from "react-dom";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";


// Solana runtime
const {SystemProgram, Keypair} = web3;
// Keypair for the account holding the GIF data
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)
// Get ProgramID from IDL
const programID = new PublicKey(idl.metadata.address);
// Set network to devnet
const network = clusterApiUrl('devnet');
// Acknowledgement of completed transaction
const opts = {
    preflightCommitment: "processed"
}
// Constants
const TWITTER_HANDLE = '0xcmrnk';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

const App = () => {

  // State
  const [walletAddress, setWalletAddrress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);
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

    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment);
        return new Provider(
            connection, window.solana, opts.preflightCommitment,
        );
    }

    const createGifAccount = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            console.log("pong!")
            await program.rpc.initialize({
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
                signers: [baseAccount]
            });
            console.log("new BaseAccount successfully created:", baseAccount.publicKey.toString());
            await getGifList();
        } catch (error) {
            console.log("S*@! Error creating BaseAccount", error);
        }
    }

  const sendGif = async () => {
      if (inputValue.length > 0 && isValidHttpUrl(inputValue)) {
          console.log('gif link:', inputValue);
          try {
              const provider = getProvider();
              const program = new Program(idl, programID, provider);
              await program.rpc.addGif(inputValue, {
                  accounts: {
                      baseAccount: baseAccount.publicKey,
                      user: provider.wallet.publicKey,
                  },
              });
              console.log("GIF transmission is a go! - ", inputValue)

              await getGifList();
          } catch (error) {
              console.log("Error sending GIF:", error)
          }
      } else {
          console.log('Bad input/no GIF given! Try again.');

      }
  };

  const onInputChange = (event) => {
      const {value} = event.target;
      setInputValue(value);
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

    const [state, setState] = useState({
        isPaneOpen: false,
        isPaneOpenLeft: false,
    });

    const renderConnectedContainer = () => {
        // The program account hasn't be initialized.
        if (gifList === null) {
            return (
                <div className="connected-container">
                    <button className="cta-button submit-gif-button" onClick={createGifAccount}>
                        Click For One-Time Initialization Of GIF Program Account
                    </button>
                </div>
            )
        }
        // Account exists. Submit GIFs.
        else {
            return(
                <div className="connected-container">
                    <input
                        type="text"
                        placeholder="Enter your .gif/.webp link!"
                        value={inputValue}
                        onChange={onInputChange}
                    />
                    <button className="cta-button submit-gif-button" onClick={sendGif}>
                        Submit
                    </button>
                    <div className="gif-grid">
                        {/* We use index as the key instead, also, the src is now item.gifLink */}
                        {gifList.map((item, index) => (
                            <div className="gif-item" key={index}>
                                <img src={item.gifLink} alt={"COOL GIF!"}/>
                                <button className="gif-button" onClick={() => setState({ isPaneOpen: true })}>
                                    Info
                                </button>

                                <SlidingPane
                                    className="gif-slideout"
                                    isOpen={state.isPaneOpen}
                                    title="GIF info"
                                    width="500px"
                                    height="500px"
                                    onRequestClose={() => {
                                        // triggered on "<" on left top click or on outside click
                                        setState({ isPaneOpen: false });
                                    }}
                                >
                                <p>Submitted by address: {item.userAddress.toString()}</p>

                                </SlidingPane>
                            </div>

                        ))}
                    </div>


                </div>
            )
        }
    }

  const getGifList = async () => {
      try {
          const provider = getProvider();
          const program = new Program(idl, programID, provider);
          const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

          console.log("Yay! Got the account:", account);
          setGifList(account.gifList);
      } catch (error) {
          console.log("Oops. Error in getGifs:", error);
          setGifList(null);
      }
  }
    useEffect(() => {
        if (walletAddress) {
            console.log('Fetching GIF list...');
            getGifList()
        }
    }, [walletAddress]);

  // UseEffects
  /* Once component mounts, wait for Phantom wallet connection */
  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkPhantomWalletConnection();
    });
  }, []);

  // useEffect(() => {
  //     if (walletAddress) {
  //         console.log('Grabbing our GIF list . . .');
  //
  //         // Call Solana program here.
  //
  //         // Set state
  //         setGifList(TEST_GIFS);
  //     }
  // }, [walletAddress]);

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
          >{`built by @${TWITTER_HANDLE} with (big) help from _buildspace!`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
