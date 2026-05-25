'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, router, user]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4">Tracker Tabungan</Typography>
            <Typography color="text.secondary">Kelola target tabunganmu dengan rapi.</Typography>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Box>
              <Button
                disabled={loading}
                variant="contained"
                onClick={async () => {
                  setError('');
                  try {
                    await signInWithGoogle();
                    router.replace('/dashboard');
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
                  }
                }}
              >
                Masuk dengan Google
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
