import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function StatCard({ title, value, color }) {
    return (
        <Card sx={{ 
            minWidth: { xs: 150, md: 200, lg: 250 },
            height: { xs: 120, md: 140, lg: 160 },
            backgroundColor: '#1e1e1e', 
            color: 'white',
            borderRadius: 3,
            boxShadow: 3,
            transition: 'all 0.3s ease-in-out',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                border: `1px solid ${color || '#00bfff'}`,
                backgroundColor: '#252525'
            }
        }}>
            <CardContent sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: { xs: 2, md: 2.5, lg: 3 }
            }}>
                <Typography 
                    sx={{ 
                        fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' }, 
                        color: '#b3b3b3',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }} 
                    gutterBottom
                >
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <Typography 
                        variant="h3" 
                        component="div" 
                        sx={{ 
                            fontWeight: 700, 
                            color: color || '#00bfff',
                            fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                            textShadow: `0 0 20px ${color || '#00bfff'}40`
                        }}
                    >
                        {value}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default StatCard;