import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import AdminButton from './AdminButton';

const meta = {
  component: AdminButton,
  tags: ['ai-generated'],
} satisfies Meta<typeof AdminButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Opprett kunde' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /opprett kunde/i });
    await expect(button).toBeVisible();
    await expect(button).not.toBeDisabled();
  },
};

export const CssCheck: Story = {
  args: { children: 'Submit' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /submit/i });
    // bg-brand = #142a4b — fails if Tailwind / globals.css did not load
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(20, 42, 75)');
  },
};

export const SizeMd: Story = {
  args: { children: 'Lagre', size: 'md' },
};

export const Disabled: Story = {
  args: { children: 'Lagre', disabled: true },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /lagre/i });
    await expect(button).toBeDisabled();
  },
};

export const FullWidth: Story = {
  args: { children: 'Full bredde', fullWidth: true },
};

export const AsLink: Story = {
  args: { children: 'Gå til kunder', href: '/admin/customers' },
};
