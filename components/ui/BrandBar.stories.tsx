import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import BrandBar from './BrandBar';

const meta = {
  component: BrandBar,
  tags: ['ai-generated'],
} satisfies Meta<typeof BrandBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Brave')).toBeVisible();
    await expect(canvas.getByText('VEKSTPROFIL')).toBeVisible();
  },
};
