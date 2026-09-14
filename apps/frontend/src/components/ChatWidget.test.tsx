import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWidget } from './ChatWidget';
import { ChatProvider } from './ChatContext';

describe('ChatWidget', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render chat button', () => {
    render(<ChatProvider><ChatWidget /></ChatProvider>);
    expect(screen.getByRole('button', { name: /abrir chat/i })).toBeInTheDocument();
  });

  it('should open chat when button clicked', () => {
    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));
    expect(screen.getByText('Irons')).toBeInTheDocument();
  });

  it('should persist messages in localStorage', () => {
    const messages = [{ role: 'user', text: 'Teste' }];
    localStorage.setItem('irons-chat-messages', JSON.stringify(messages));
    
    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));
    expect(screen.getByText('Teste')).toBeInTheDocument();
  });
});
