import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import PageHeader from './PageHeader';

const meta = {
  component: PageHeader,
  tags: ['ai-generated'],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Kunder',
    href: '/admin/customers/new',
    cta: 'Ny kunde',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Kunder')).toBeVisible();
    await expect(canvas.getByRole('link', { name: /ny kunde/i })).toBeVisible();
  },
};

export const WithCustomLabel: Story = {
  args: {
    title: 'Surveys',
    label: 'Administrasjon',
    href: '/admin/surveys/new',
    cta: 'Ny survey',
  },
};
