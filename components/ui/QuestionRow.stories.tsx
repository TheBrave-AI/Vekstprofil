import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import QuestionRow from './QuestionRow';

const meta = {
  component: QuestionRow,
  tags: ['ai-generated'],
} satisfies Meta<typeof QuestionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {
  args: {
    category: 'Salg',
    label: 'Hva er ditt nåværende salgsvolum?',
    right: <span className="font-display text-cloud text-[22px]">2 400 000</span>,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Salg')).toBeVisible();
    await expect(canvas.getByText('Hva er ditt nåværende salgsvolum?')).toBeVisible();
  },
};

export const WithoutCategory: Story = {
  args: {
    label: 'Har dere et CRM-system?',
    right: <span className="text-cloud font-medium">Ja</span>,
  },
};

export const Clickable: Story = {
  args: {
    category: 'Marked',
    label: 'Klikk for å redigere',
    right: <span className="text-muted text-sm">→</span>,
    onClick: fn(),
  },
  play: async ({ canvas, userEvent }) => {
    const row = canvas.getByRole('button', { name: /klikk for å redigere/i });
    await expect(row).toBeVisible();
    await userEvent.click(row);
  },
};
