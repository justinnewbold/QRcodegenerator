import type { Meta, StoryObj } from '@storybook/react';
import { KeyboardShortcutsHelp } from '../components/keyboard-shortcuts-help';

const meta: Meta<typeof KeyboardShortcutsHelp> = {
  title: 'Components/KeyboardShortcutsHelp',
  component: KeyboardShortcutsHelp,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when modal is closed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};
