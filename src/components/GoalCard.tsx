'use client';

import Link from 'next/link';
import { Card, CardActionArea, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { SavingGoal } from '@/types/saving';
import { formatIDR } from '@/lib/formatCurrency';
import { calculateProgress } from '@/lib/progress';

export default function GoalCard({ goal }: { goal: SavingGoal }) {
  const progress = calculateProgress(goal.currentBalance, goal.targetAmount);
  return (
    <Card>
      <CardActionArea component={Link} href={`/goals/${goal.id}`}>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{goal.name}</Typography>
              <Chip
                label={goal.status === 'active' ? 'Aktif' : goal.status === 'completed' ? 'Selesai' : 'Arsip'}
                color={goal.status === 'completed' ? 'success' : goal.status === 'archived' ? 'default' : 'primary'}
                size="small"
              />
            </Stack>
            <Typography color="text.secondary">
              {formatIDR(goal.currentBalance)} / {formatIDR(goal.targetAmount)}
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2">{progress}% tercapai</Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
