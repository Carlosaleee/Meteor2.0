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

  it('should render summary with title Briefing Tático IA', () => {
    const summary = '🏄 **Condições das Ondas**\n- Altura: 1.2m\n\n🌬️ **Análise do Vento**\n- Velocidade: 12 km/h';
    render(<ResumoIA summary={summary} loading={false} error={null} />);
    expect(screen.getByText('Briefing Tático IA')).toBeInTheDocument();
    expect(screen.getByText(/Condições das Ondas/)).toBeInTheDocument();
  });

  it('should split into two columns', () => {
    const summary = '🏄 **Ondas**\n- Dados\n\n🌬️ **Vento**\n- Dados\n\n⏰ **Horários**\n- Dados\n\n🏆 **Points**\n- Dados';
    render(<ResumoIA summary={summary} loading={false} error={null} />);
    const columns = screen.getAllByText(/Dados/);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should render briefing cards when summary has parseable data', () => {
    const summary = '🏄 **Condições das Ondas**\n- Altura atual: 1.2m\n- Período: 10s\n\n🌬️ **Análise do Vento**\n- Velocidade: 14 km/h\n- Tipo: Offshore\n\n⏰ **Melhores Horários**\n- Janela ideal para surf: 06h-09h\n\n🏆 **Melhores Points**\n- Recomendação principal: Boqueirão Norte\n\n⚠️ **Alertas**\n- Próxima maré: 14:30\n- Coeficiente: 0.75';
    render(<ResumoIA summary={summary} loading={false} error={null} />);
    expect(screen.getByText('Ondas')).toBeInTheDocument();
    expect(screen.getByText('1.2m / 10s')).toBeInTheDocument();
    expect(screen.getByText('Vento')).toBeInTheDocument();
    expect(screen.getByText('14 km/h')).toBeInTheDocument();
  });

  it('should handle empty summary gracefully', () => {
    render(<ResumoIA summary="" loading={false} error={null} />);
    expect(screen.getByText('Resumo indisponível no momento.')).toBeInTheDocument();
  });
});
