import React, {useEffect, useState} from "react";

import {Header, MenuItems, ReactButton} from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";
import Canvas from "./components/Canvas";
import {MoralisAPI} from "./hooks/MoralisAPI";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {useMatch} from 'react-router-dom';

const BASE_PATH = '/musicNFT-viewer/address';
function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  const [account, setAccount] = useState("");
  const [rendered, setRendered] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      try {
        if (!provider) {
          return;
        }

        // Load the user's accounts.
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);

        // Resolve the ENS name for the first account.
        const name = await provider.lookupAddress(accounts[0]);

        // Render either the ENS name or the shortened account address.
        if (name) {
          setRendered(name);
        } else {
          setRendered(account.substring(0, 6) + "..." + account.substring(36));
        }
      } catch (err) {
        setAccount("");
        setRendered("");
        console.error(err);
      }
    }
    fetchAccount();
  }, [account, provider, setAccount, setRendered]);

  return (
    <ReactButton
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && "Disconnect Wallet"}
    </ReactButton>
  );
}

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [contractAddress, setContractAddress] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [playbackURL, setPlaybackURL] = useState(null);
  const [address, setAddress] = useState(null);
  const moralisAPI = new MoralisAPI();

  let match = useMatch(`${BASE_PATH}/:slug`);
  const urlAddress = match && match.params && match.params.slug;

  useEffect(() => {
    if (!contractAddress || !contractAddress.length || nfts.length > 0) {
      return;
    }
    moralisAPI.getNFTs(contractAddress).then(nfts => {
      setNfts(nfts);
    });
  }, [contractAddress, moralisAPI]);

  useEffect(() => {
    if (urlAddress) {
      setContractAddress(urlAddress);
    }
    if (!provider) {
      return;
    }
    (async () => {
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const newAddress = `${BASE_PATH}/${accounts[0]}`;
        setAddress(newAddress);
      }
    })();
  }, [provider, urlAddress]);

  useEffect(() => {
    console.log(playbackURL);
  }, [playbackURL]);

  const randomAddress = () => {
    const musicNFTHolders = [
      '0x5567c85cbbe24c65c80783b520ea538552f47a88'
    ];
    return `${BASE_PATH}/${musicNFTHolders[Math.floor(Math.random() * musicNFTHolders.length)]}`;
  };
  return (
    <div>
      <Header>
        <MenuItems>
          <h4 style={{marginLeft: '10px' }} onClick={() => {
            window.location.href = randomAddress();
          }}>Music NFT Collection</h4>
          {address && <ReactButton onClick={() => {
            window.location.href = address;
          }}>Profile</ReactButton> }
        </MenuItems>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Canvas url={playbackURL} />
      {/*<UserInfo />*/}
      {
        nfts.filter(nft => { return !!nft.metadata && !!nft.metadata.animation_url })
            .map((nft, idx) => {
              return (
                  <Card sx={{ maxWidth: 300, float: 'left' }} key={idx}>
                    <CardMedia
                        component="img"
                        height="140px"
                        width="140px"
                        image={ nft.metadata.image }
                        alt={ nft.metadata.name } />
                    <CardContent>
                      <Typography variant={"b"}>{nft.metadata.name}</Typography>
                    </CardContent>

                    {
                      nft.metadata.animation_url ?
                          <CardActions>
                            <Button size="large" onMouseUp={() => {
                              console.log(`Touch ended!`);
                              if (playbackURL === nft.metadata.animation_url) {
                                setPlaybackURL(null);
                                return;
                              }
                              setPlaybackURL(nft.metadata.animation_url);
                            }} >{ (playbackURL !== nft.metadata.animation_url) ? "play" : "stop" }</Button>
                          </CardActions> : <div/>
                    }
                  </Card>
              )
        })
      }
    </div>
  );
}

export default App;
