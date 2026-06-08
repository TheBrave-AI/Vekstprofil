import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import FormField from './FormField';

const meta = {
  component: FormField,
  tags: ['ai-generated'],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Bedriftsnavn', placeholder: 'Skriv inn bedriftsnavn' },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Bedriftsnavn');
    await expect(input).toBeVisible();
  },
};

export const Required: Story = {
  args: { label: 'E-post', required: true, type: 'email', placeholder: 'din@epost.no' },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText(/e-post/i);
    await expect(input).toHaveAttribute('required');
  },
};

export const WithValue: Story = {
  args: { label: 'Kontaktperson', defaultValue: 'Andreas Vege' },
};
