import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWidget } from './ChatWidget';
import { ChatProvider } from './ChatContext';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
  localStorage.clear();

  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ChatWidget', () => {
  it('should render chat button', () => {
    render(<ChatProvider><ChatWidget /></ChatProvider>);
    expect(screen.getByRole('button', { name: /abrir chat/i })).toBeInTheDocument();
  });

  it('should open chat when button clicked', () => {
    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));
    expect(screen.getByText('IRONS')).toBeInTheDocument();
  });

  it('should show welcome message with capabilities', () => {
    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));
    expect(screen.getByText(/Sou o/)).toBeInTheDocument();
    expect(screen.getByText(/Rankings e eventos da WSL/)).toBeInTheDocument();
  });

  it('should persist messages in localStorage', () => {
    const messages = [{ role: 'user', text: 'Teste' }];
    localStorage.setItem('irons-chat-messages', JSON.stringify(messages));

    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));
    expect(screen.getByText('Teste')).toBeInTheDocument();
  });

  it('should send message to API and display reply', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'Resposta do Irons via API' }),
    });

    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));

    fireEvent.change(screen.getByPlaceholderText(/pergunte/i), { target: { value: 'como esta o tempo?' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText('Resposta do Irons via API')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/v1/iron/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      },
    );

    const sentBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
    expect(sentBody.message).toBe('como esta o tempo?');
    expect(typeof sentBody.sessionId).toBe('string');
    expect(sentBody.sessionId.length).toBeGreaterThan(0);
    expect(Array.isArray(sentBody.history)).toBe(true);
    expect(sentBody.history[0]).toEqual({ role: 'assistant', content: expect.any(String) });
  });

  it('should show user message immediately', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'Ok' }),
    });

    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));

    fireEvent.change(screen.getByPlaceholderText(/pergunte/i), { target: { value: 'oi' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(screen.getByText('oi')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Ok')).toBeInTheDocument();
    });
  });

  it('should show error when API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));

    fireEvent.change(screen.getByPlaceholderText(/pergunte/i), { target: { value: 'oi' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Não consegui processar sua mensagem/)).toBeInTheDocument();
    });
  });

  it('should show error when network fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));

    fireEvent.change(screen.getByPlaceholderText(/pergunte/i), { target: { value: 'oi' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Não consegui processar sua mensagem/)).toBeInTheDocument();
    });
  });

  it('should restart conversation and remove stored messages', () => {
    localStorage.setItem('irons-chat-messages', JSON.stringify([{ role: 'user', text: 'Mensagem antiga' }]));

    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));
    expect(screen.getByText('Mensagem antiga')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar conversa' }));

    expect(screen.getByText(/Sou o/)).toBeInTheDocument();
    expect(screen.getByText(/Rankings e eventos da WSL/)).toBeInTheDocument();
    expect(screen.queryByText('Mensagem antiga')).not.toBeInTheDocument();
    expect(localStorage.getItem('irons-chat-messages')).toBeNull();
  });

  it('should clear conversation when confirmation is accepted', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.setItem('irons-chat-messages', JSON.stringify([{ role: 'user', text: 'Mensagem antiga' }]));

    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));
    expect(screen.getByText('Mensagem antiga')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Apagar conversa' }));

    expect(confirmSpy).toHaveBeenCalledWith('Apagar toda a conversa?');
    expect(screen.queryByText('Mensagem antiga')).not.toBeInTheDocument();
    expect(screen.getByText(/Nenhuma mensagem/)).toBeInTheDocument();
    expect(localStorage.getItem('irons-chat-messages')).toBeNull();
  });

  it('should keep conversation when confirmation is cancelled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    localStorage.setItem('irons-chat-messages', JSON.stringify([{ role: 'user', text: 'Mensagem antiga' }]));

    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Apagar conversa' }));

    expect(confirmSpy).toHaveBeenCalledWith('Apagar toda a conversa?');
    expect(screen.getByText('Mensagem antiga')).toBeInTheDocument();
    expect(screen.queryByText(/Nenhuma mensagem/)).not.toBeInTheDocument();
  });

  it('should announce restart in aria-live status region', () => {
    render(<ChatProvider><ChatWidget /></ChatProvider>);
    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar conversa' }));

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Conversa reiniciada');
  });
});
