import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import SectionHeader from './SectionHeader';

const meta = {
  component: SectionHeader,
  tags: ['ai-generated'],
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDot: Story = {
  args: { label: 'Aktive surveys', count: 3, dotColor: 'bg-amber' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Aktive surveys')).toBeVisible();
    await expect(canvas.getByText('(3)')).toBeVisible();
  },
};

export const WithoutDot: Story = {
  args: { label: 'Fullførte', count: 12 },
};

export const ZeroCount: Story = {
  args: { label: 'Utkast', count: 0, dotColor: 'bg-steel' },
};
