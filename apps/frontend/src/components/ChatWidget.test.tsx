import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWidget } from './ChatWidget';

describe('ChatWidget', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render chat button', () => {
    render(<ChatWidget />);
    expect(screen.getByRole('button', { name: /abrir chat/i })).toBeInTheDocument();
  });

  it('should open chat when button clicked', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));
    expect(screen.getByText('Irons')).toBeInTheDocument();
  });

  it('should persist messages in localStorage', () => {
    const messages = [{ role: 'user', text: 'Teste' }];
    localStorage.setItem('irons-chat-messages', JSON.stringify(messages));
    
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));
    expect(screen.getByText('Teste')).toBeInTheDocument();
  });
});
