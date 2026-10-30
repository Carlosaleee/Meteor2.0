import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SourceBadge } from './SourceBadge';
import type { MeteorologyResponse } from '@/lib/api';

const base = (overrides: Partial<MeteorologyResponse>): MeteorologyResponse => ({
  location: 'Ilha Comprida',
  locationId: 'ilha-comprida',
  timestamp: '2026-10-30T14:00:00.000Z',
  current: {
    temperature: 22,
    apparentTemperature: 22,
    humidity: 80,
    windSpeed: 15,
    windDirection: 90,
    pressure: 1015,
    precipitation: 0,
    weatherCode: 1,
  },
  hourly: [],
  daily: [],
  ...overrides,
});

describe('SourceBadge', () => {
  it('renders "Previsão atualizada" for live data with fetch time', () => {
    render(
      <SourceBadge
        data={base({
          source: 'live',
          fetchedAt: '2026-10-30T13:00:00.000Z',
          ageHours: 1,
          meta: { dataKind: 'forecast', provider: 'Open-Meteo', model: 'best_match' },
        })}
      />,
    );
    expect(screen.getByTestId('source-badge')).toHaveTextContent('Previsão atualizada');
    expect(screen.getByText(/Coleta:/)).toHaveTextContent('1h');
    expect(screen.getByText('Previsão (modelo)')).toBeInTheDocument();
  });

  it('renders "Dados desatualizados" for stale fallback', () => {
    render(<SourceBadge data={base({ source: 'stale', fetchedAt: '2026-10-28T10:00:00.000Z', ageHours: 52 })} />);
    expect(screen.getByTestId('source-badge')).toHaveTextContent('Dados desatualizados');
    expect(screen.getByText(/Coleta:/)).toHaveTextContent('(52h)');
  });

  it('renders "Dados de exemplo" for synthetic sample content', () => {
    render(<SourceBadge data={base({ source: 'sample', meta: { dataKind: 'sample', provider: 'synthetic' } })} />);
    expect(screen.getByTestId('source-badge')).toHaveTextContent('Dados de exemplo');
    expect(screen.getByText('Sintético')).toBeInTheDocument();
    expect(screen.getByText(/Coleta:/)).toHaveTextContent('--');
  });

  it('renders neutral loading state when data is null (antes da 1a resposta)', () => {
    render(<SourceBadge data={null} />);
    expect(screen.getByTestId('source-badge')).toHaveTextContent('Carregando…');
    // nunca anuncia frescor sem dados
    expect(screen.queryByText('Previsão atualizada')).not.toBeInTheDocument();
  });

  it('renders loading state when data is undefined (sem props)', () => {
    render(<SourceBadge />);
    expect(screen.getByTestId('source-badge')).toHaveTextContent('Carregando…');
  });
});
