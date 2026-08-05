import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalculationService } from '../services/calculationService';
import { QueryParams } from '../types/api.types';
import { Perhitungan } from '../types/database.types';

export const PERHITUNGAN_QUERY_KEY = 'perhitungan';

export function usePerhitungan(params: QueryParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [PERHITUNGAN_QUERY_KEY, params],
    queryFn: () => CalculationService.getCalculations(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30, // 30 seconds
  });

  const createMutation = useMutation({
    mutationFn: (payload: Omit<Perhitungan, 'created_at' | 'updated_at' | 'synced_at'>) =>
      CalculationService.saveCalculation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PERHITUNGAN_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_metrics'] });
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: (payloads: Omit<Perhitungan, 'created_at' | 'updated_at' | 'synced_at'>[]) =>
      CalculationService.saveBatchCalculations(payloads),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PERHITUNGAN_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_metrics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CalculationService.deleteCalculation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PERHITUNGAN_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_metrics'] });
    },
  });

  return {
    ...query,
    dataList: query.data?.data || [],
    pagination: query.data?.pagination,
    metrics: query.data?.metrics,
    createCalculation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createBatchCalculations: createBatchMutation.mutateAsync,
    isCreatingBatch: createBatchMutation.isPending,
    deleteCalculation: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
