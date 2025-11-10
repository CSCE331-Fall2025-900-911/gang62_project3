import * as React from 'react';
import AppTheme from '../shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

export default function Kiosk(...props) {
    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <Box>
                Hi
            </Box>
            
        </AppTheme>
    )
}