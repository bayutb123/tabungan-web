'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { AppBar, Avatar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { useAuth } from '@/providers/AuthProvider';

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, signOutUser } = useAuth();
  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tracker Tabungan
          </Typography>
          <Button color="inherit" component={Link} href="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} href="/settings">
            Settings
          </Button>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={user?.photoURL ?? undefined} sx={{ width: 28, height: 28 }}>
              {user?.displayName?.charAt(0) ?? 'U'}
            </Avatar>
            <Button color="inherit" onClick={() => signOutUser()}>
              Keluar
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>{children}</Container>
    </Box>
  );
}
