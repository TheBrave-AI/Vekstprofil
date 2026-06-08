import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import EmptyState from './EmptyState';

const meta = {
  component: EmptyState,
  tags: ['ai-generated'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTitle: Story = {
  args: {
    title: 'Ingen kunder ennå',
    children: 'Opprett en ny kunde for å komme i gang.',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Ingen kunder ennå')).toBeVisible();
    await expect(canvas.getByText(/opprett en ny kunde/i)).toBeVisible();
  },
};

export const WithoutTitle: Story = {
  args: {
    children: 'Det finnes ingen spørsmål i katalogen.',
  },
};
