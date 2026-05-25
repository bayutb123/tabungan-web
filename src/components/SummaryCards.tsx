'use client';

import { Card, CardContent, Grid, Typography } from '@mui/material';
import { formatIDR } from '@/lib/formatCurrency';

type Props = {
  totalBalance: number;
  totalTarget: number;
  totalProgress: number;
  activeCount: number;
};

export default function SummaryCards({ totalBalance, totalTarget, totalProgress, activeCount }: Props) {
  const items = [
    { label: 'Total Saldo', value: formatIDR(totalBalance) },
    { label: 'Total Target', value: formatIDR(totalTarget) },
    { label: 'Progress Keseluruhan', value: `${totalProgress}%` },
    { label: 'Goal Aktif', value: String(activeCount) },
  ];

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">{item.label}</Typography>
              <Typography variant="h6">{item.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
