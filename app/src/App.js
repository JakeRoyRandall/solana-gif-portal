import { useState, useEffect } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from './idl.json';
import kp from './keypair.json'

const { SystemProgram, Keypair } = web3;
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts = { preflightCommitment: "processed" }
// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
    "https://media0.giphy.com/media/8Ry7iAVwKBQpG/giphy.gif?cid=790b7611c70b9daec1b68f9bea6cd3b31edd11c5746205ff&rid=giphy.gif&ct=g",
    "https://media4.giphy.com/media/l0IyoieFSfr2Xcbza/giphy.gif?cid=790b7611acaab7817498156fcf8e4e0bd289d4fe159a173e&rid=giphy.gif&ct=g",
    "https://media3.giphy.com/media/7eAvzJ0SBBzHy/giphy.gif?cid=790b7611b3857dedc98435f1194d4acd4caeb2efd0a5ab7f&rid=giphy.gif&ct=g",
  ];

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState(null);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            "Connected with Public Key:",
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Get a Phantom Wallet 👻");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const sendGif = async () => {
	if (inputValue.length === 0) {
	  console.log("No gif link given!")
	  return
	}
	console.log('Gif link:', inputValue);
	try {
	  setInputValue("");
	  const provider = getProvider();
	  const program = new Program(idl, programID, provider);
  
	  await program.rpc.addGif(inputValue, {
		accounts: {
		  baseAccount: baseAccount.publicKey,
		  user: provider.wallet.publicKey,
		},
	  });
	  console.log("GIF sucesfully sent to program", inputValue)
  
	  await getGifList();
	} catch (error) {
	  console.log("Error sending GIF:", error)
	}
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
	const connection = new Connection(network, opts.preflightCommitment);
	const provider = new Provider(
	  connection, window.solana, opts.preflightCommitment,
	);
	  return provider;
  }

  const createGifAccount = async () => {
	try {
	  const provider = getProvider();
	  const program = new Program(idl, programID, provider);
	  console.log("ping")
	  await program.rpc.startStuffOff({
		accounts: {
		  baseAccount: baseAccount.publicKey,
		  user: provider.wallet.publicKey,
		  systemProgram: SystemProgram.programId,
		},
		signers: [baseAccount]
	  });
	  console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
	  await getGifList();
  
	} catch(error) {
	  console.log("Error creating BaseAccount account:", error)
	}
  }

  const renderConnectedContainer = () => {
  if (gifList === null) {
    return (
      <div className="connected-container">
        <button className="cta-button submit-gif-button" onClick={createGifAccount}>
          Do One-Time Initialization For GIF Program Account
        </button>
      </div>
    )
  } 
	// Otherwise, we're good! Account exists. User can submit GIFs.
	else {
    return(
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input
            type="text"
            placeholder="Enter gif link!"
            value={inputValue}
            onChange={onInputChange}
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
        <div className="gif-grid">
					{/* We use index as the key instead, also, the src is now item.gifLink */}
          {gifList.map((item, index) => (
            <div className="gif-item" key={index}>
              <img src={item.gifLink} alt={item.gifLink}/>
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
			console.log("got the account", account);
			setGifList(account.gifList);
		} catch (error) {
			console.error(error);
			setGifList(null)
		}
	}

  useEffect(() => {
	const onLoad = async () => {
	  await checkIfWalletIsConnected();
	};
	window.addEventListener('load', onLoad);
	return () => window.removeEventListener('load', onLoad);
  }, []);
  
  useEffect(() => {
	if (walletAddress) {
	  console.log('Fetching GIF list...');
	  
	  // Call Solana program here.
  
	  // Set state
	  getGifList()
	}
  }, [walletAddress]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress
            ? renderNotConnectedContainer()
            : renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
