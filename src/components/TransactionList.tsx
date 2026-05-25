'use client';

import { Card, CardContent, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { formatIDR } from '@/lib/formatCurrency';
import { SavingTransaction } from '@/types/saving';

export default function TransactionList({ transactions }: { transactions: SavingTransaction[] }) {
  if (!transactions.length) {
    return <Typography color="text.secondary">Belum ada transaksi.</Typography>;
  }

  return (
    <List disablePadding>
      {transactions.map((trx) => {
        const sign = trx.type === 'deposit' ? '+' : '-';
        return (
          <ListItem key={trx.id} disableGutters sx={{ mb: 1 }}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <ListItemText
                    primary={trx.type === 'deposit' ? 'Setoran' : 'Penarikan'}
                    secondary={new Intl.DateTimeFormat('id-ID').format(trx.transactionDate)}
                  />
                  <Stack alignItems="flex-end">
                    <Typography color={trx.type === 'deposit' ? 'success.main' : 'error.main'}>
                      {sign}
                      {formatIDR(trx.amount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Saldo: {formatIDR(trx.balanceAfter)}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </ListItem>
        );
      })}
    </List>
  );
}
