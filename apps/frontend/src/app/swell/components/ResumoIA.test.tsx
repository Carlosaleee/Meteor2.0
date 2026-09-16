import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResumoIA } from './ResumoIA';

describe('ResumoIA', () => {
  it('should render loading state', () => {
    render(<ResumoIA summary={null} loading={true} error={null} />);
    expect(screen.getByLabelText('Carregando resumo IA')).toBeInTheDocument();
  });

  it('should render error state', () => {
    render(<ResumoIA summary={null} loading={false} error="Erro de teste" />);
    expect(screen.getByText('Resumo indisponível no momento.')).toBeInTheDocument();
  });

  it('should render summary content', () => {
    const summary = '🏄 **Condições das Ondas**\n- Altura: 1.2m\n\n🌬️ **Análise do Vento**\n- Velocidade: 12 km/h';
    render(<ResumoIA summary={summary} loading={false} error={null} />);
    expect(screen.getByText('Briefing IA — Gemini Flash')).toBeInTheDocument();
    expect(screen.getByText(/Condições das Ondas/)).toBeInTheDocument();
  });

  it('should split into two columns', () => {
    const summary = '🏄 **Ondas**\n- Dados\n\n🌬️ **Vento**\n- Dados\n\n⏰ **Horários**\n- Dados\n\n🏆 **Points**\n- Dados';
    render(<ResumoIA summary={summary} loading={false} error={null} />);
    const columns = screen.getAllByText(/Dados/);
    expect(columns.length).toBeGreaterThan(0);
  });
});
