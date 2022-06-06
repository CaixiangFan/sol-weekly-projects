import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Item } from '@mui/material';
import Layout from 'components/Layout';
import NftCard from 'components/NftCard';
import axios from 'axios';

const Home = () => {
  const URL = 'http://localhost:3000/'; // Backend API 
  const [nfts, setNfts] = useState([]);

  const getNfts = async (url) => {
    const results = await axios.get(url);
    // console.log(results.data)
    const myNfts = Object.values(results.data);
    setNfts(myNfts);
    // myNfts.forEach(nft => {
    //   console.log(nft)
    // })
  };

  useEffect(() => {
    getNfts(URL);
  }, []);
  return (
    <Layout title="Home">
      <Grid container spacing={2}>
        {nfts.length > 0 &&
          nfts.map((nft, i) => (
            <Grid item key={i} sx={{ width: 300, margin: '0.1rem' }}>
              <NftCard
                name={nft.metadata.name}
                description={nft.metadata.description}
                author={nft.metadata.author}
                score={nft.metadata.score}
                image={nft.ipfs.path}
              />
            </Grid>
          ))}
      </Grid>
    </Layout>
  );
};

export default Home;
