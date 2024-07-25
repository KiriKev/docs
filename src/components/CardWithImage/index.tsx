import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

export default function CardWithImage({ CardData }) {
  return (
    <div class="cardwithimage">
      {CardData.map((item, index) => (
        <Card sx={{ maxWidth: 345 }} key={index}>
          <CardMedia
            sx={{ height: 140 }}
            image={item.image}
            title={item.imageTitle}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {item.cardHeading}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <ul>
                {item.cardContent.map((link, index) => (
                  <li key={index}>
                    <a href={link.linkPath}>{link.linkText}</a>
                  </li>
                ))}
              </ul>
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
