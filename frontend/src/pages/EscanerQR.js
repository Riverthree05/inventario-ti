import React from 'react';
import QRScanner from '../components/qr/QRScanner';
import { Box } from '@mui/material';

function EscanerQR() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
      <QRScanner />
    </Box>
  );
}

export default EscanerQR;