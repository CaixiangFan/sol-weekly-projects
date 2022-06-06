import React, { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';

import { Store } from 'utils/Store';
import TopBar from 'components/TopBar';
import { Box, Container } from '@mui/system';

const Layout = ({ title, children }) => {
  return (
    <div>
      <Head>
        <title>{title ? `${title} - NFT Marketplace` : `NFT Marketplace`}</title>
      </Head>
      <TopBar />
      <Container maxWidth="100vh" style={{paddingTop: "0.5rem"}}>
        {children}
      </Container>
    </div>
  );
};

export default Layout;
