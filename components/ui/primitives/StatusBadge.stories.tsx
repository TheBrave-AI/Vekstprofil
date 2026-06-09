import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import StatusBadge from './StatusBadge';

const meta = {
  component: StatusBadge,
  tags: ['ai-generated'],
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Submitted: Story = {
  args: { status: 'submitted' },
  play: async ({ canvas }) => {
    const badge = canvas.getByText('Besvart');
    await expect(badge).toBeVisible();
  },
};

export const Active: Story = {
  args: { status: 'active' },
};

export const Draft: Story = {
  args: { status: 'draft' },
};
