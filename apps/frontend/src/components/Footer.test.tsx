import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('should render emergency contacts', () => {
    render(<Footer />);
    expect(screen.getByText('Polícia Civil')).toBeInTheDocument();
    expect(screen.getByText('Bombeiros')).toBeInTheDocument();
    expect(screen.getByText('SAMU')).toBeInTheDocument();
  });

  it('should render all phone numbers', () => {
    render(<Footer />);
    expect(screen.getByText('190')).toBeInTheDocument();
    expect(screen.getByText('193')).toBeInTheDocument();
    expect(screen.getByText('192')).toBeInTheDocument();
    expect(screen.getByText('199')).toBeInTheDocument();
  });

  it('should render copyright', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
  });
});
