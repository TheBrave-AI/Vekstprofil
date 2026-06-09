import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import NotAnsweredPill from './NotAnsweredPill';

const meta = {
  component: NotAnsweredPill,
  tags: ['ai-generated'],
} satisfies Meta<typeof NotAnsweredPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotAnswered: Story = {
  args: { skipped: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Ikke besvart')).toBeVisible();
  },
};

export const Skipped: Story = {
  args: { skipped: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Hoppet over')).toBeVisible();
  },
};

export const NotSpecified: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Ikke oppgitt')).toBeVisible();
  },
};
