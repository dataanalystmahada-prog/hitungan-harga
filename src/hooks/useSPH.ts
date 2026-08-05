import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SPHService } from '../services/sphService';
import { QueryParams } from '../types/api.types';
import { CreateSPHInput } from '../types/pricing.types';
import { SPHStatus } from '../types/database.types';

export const SPH_QUERY_KEY = 'sph';

export function useSPH(params: QueryParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [SPH_QUERY_KEY, params],
    queryFn: () => SPHService.getSPHList(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateSPHInput) => SPHService.createSPH(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SPH_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_metrics'] });
    },
  });

  const getNextSPHNumberMutation = useMutation({
    mutationFn: (brandCode: string) => SPHService.getNextSPHNumber(brandCode),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SPHStatus }) =>
      SPHService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SPH_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_metrics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SPHService.deleteSPH(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SPH_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_metrics'] });
    },
  });

  return {
    ...query,
    dataList: query.data?.data || [],
    pagination: query.data?.pagination,
    metrics: query.data?.metrics,
    createSPH: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    deleteSPH: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    getNextSPHNumber: getNextSPHNumberMutation.mutateAsync,
  };
}
