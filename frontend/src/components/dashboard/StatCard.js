import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

function StatCard({ title, value, color }) {
    return (
        <Card sx={{ minWidth: 200, backgroundColor: '#1e1e1e', color: 'white' }}>
            <CardContent>
                <Typography sx={{ fontSize: 16, color: '#ccc' }} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color || '#61dafb' }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default StatCard;