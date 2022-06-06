import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

const NftCard = ({ name, description, author, score, image }) => {
  const imageUrl = `https://ipfs.io/ipfs/${image}`;
  return (
    <Card sx={{ width: '250px', margin: '0.5rem' }}>
      <CardMedia component="img" height="140" image={imageUrl} alt={name} />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Description: {description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Author: {author}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Score: {score}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NftCard;
