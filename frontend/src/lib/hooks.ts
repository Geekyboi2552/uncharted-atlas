'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFromAPI } from './api';
import type {
  Portfolio,
  Holding,
  Instrument,
  PricePoint,
  ComputedMetric,
  CorrelationMatrix,
} from './types';

// ---- Portfolios -----------------------------------------------------------

export function usePortfolios() {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: () => fetchFromAPI<Portfolio[]>('/portfolios'),
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      fetchFromAPI<Portfolio>('/portfolios', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolios'] }),
  });
}

// ---- Holdings ---------------------------------------------------------

export function useHoldings(portfolioId: number | null) {
  return useQuery({
    queryKey: ['holdings', portfolioId],
    queryFn: () => fetchFromAPI<Holding[]>(`/portfolios/${portfolioId}/holdings`),
    enabled: portfolioId !== null,
  });
}

export function useAddHolding(portfolioId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ticker: string; quantity: number; average_buy_price: number }) =>
      fetchFromAPI<Holding>(`/portfolios/${portfolioId}/holdings`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['holdings', portfolioId] }),
  });
}

// ---- Market -----------------------------------------------------------

export function useInstruments() {
  return useQuery({
    queryKey: ['instruments'],
    queryFn: () => fetchFromAPI<Instrument[]>('/market/instruments'),
  });
}

export function usePrices(ticker: string | null, limit = 252) {
  return useQuery({
    queryKey: ['prices', ticker, limit],
    queryFn: () => fetchFromAPI<PricePoint[]>(`/market/prices/${ticker}?limit=${limit}`),
    enabled: !!ticker,
  });
}

// ---- Analytics ----------------------------------------------------------

export function usePortfolioAnalytics(portfolioId: number | null) {
  return useQuery({
    queryKey: ['analytics', 'portfolio', portfolioId],
    queryFn: () => fetchFromAPI<ComputedMetric[]>(`/analytics/portfolio/${portfolioId}`),
    enabled: portfolioId !== null,
    retry: false, // backend 404s until metrics exist for this portfolio
  });
}

export function useCorrelationMatrix() {
  return useQuery({
    queryKey: ['analytics', 'correlation'],
    queryFn: () => fetchFromAPI<CorrelationMatrix | { message: string }>('/analytics/correlation'),
  });
}
