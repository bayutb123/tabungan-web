'use client';

import { Alert, Stack, Typography } from '@mui/material';

export default function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Stack spacing={1}>
      <Alert severity="info">{title}</Alert>
      <Typography color="text.secondary">{description}</Typography>
    </Stack>
  );
}
