import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import FormSubmitButton from './FormSubmitButton';

const meta = {
  component: FormSubmitButton,
  tags: ['ai-generated'],
} satisfies Meta<typeof FormSubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Opprett kunde', isPending: false },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /opprett kunde/i });
    await expect(button).toBeVisible();
    await expect(button).not.toBeDisabled();
  },
};

export const Pending: Story = {
  args: { label: 'Opprett kunde', isPending: true },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /oppretter/i });
    await expect(button).toBeDisabled();
  },
};

export const Disabled: Story = {
  args: { label: 'Lagre', isPending: false, disabled: true },
};

export const NotFullWidth: Story = {
  args: { label: 'Lagre endringer', isPending: false, fullWidth: false },
};
