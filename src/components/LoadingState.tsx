'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingState({ message = 'Memuat data...' }: { message?: string }) {
  return (
    <Box minHeight="40vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
