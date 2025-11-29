import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export default function MediaCard({titulo, descripcion, imagen, rutaBoton}) {
  return (
    <Card sx={{ maxWidth: 345, height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#1e1e1e', color: '#ffffff' }}>
      <CardMedia
        sx={{ height: 140 }}
        image={imagen}
        title="Imagen Proyectos"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {titulo}
        </Typography>
        <Typography variant="body2" sx={{ color: '#cccccc' }}>
{descripcion}
        </Typography>
      </CardContent>
      <CardActions>
        
        <Link href={{rutaBoton}} ><Button size="small">Detalles Del Proyecto</Button></Link>
      </CardActions>
    </Card>
  );
}
