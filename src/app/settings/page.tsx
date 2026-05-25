'use client';

import { Avatar, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/providers/AuthProvider';

export default function SettingsPage() {
  const { user, signOutUser } = useAuth();
  return (
    <AuthGuard>
      <AppShell>
        <Card>
          <CardContent>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="h5">Settings</Typography>
              <Avatar src={user?.photoURL ?? undefined} sx={{ width: 64, height: 64 }}>
                {user?.displayName?.charAt(0) ?? 'U'}
              </Avatar>
              <Typography>Nama: {user?.displayName}</Typography>
              <Typography>Email: {user?.email}</Typography>
              <Typography>Mata uang: IDR</Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={async () => {
                  await signOutUser();
                }}
              >
                Keluar
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
