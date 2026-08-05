import { useQuery } from '@tanstack/react-query';
import { MasterDataService } from '../services/masterDataService';

export const MASTER_DATA_QUERY_KEY = 'master_data_all';

export function useMasterData() {
  const query = useQuery({
    queryKey: [MASTER_DATA_QUERY_KEY],
    queryFn: () => MasterDataService.getAllMasterData(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    masterProduk: query.data?.masterProduk || [],
    modalProduk: query.data?.modalProduk || [],
    modalLogo: query.data?.modalLogo || [],
    margin: query.data?.margin || [],
    brands: query.data?.brands || [],
    users: query.data?.users || [],
    divisi: query.data?.divisi || [],
    keterangan: query.data?.keterangan || [],
    prompts: query.data?.prompts || [],
  };
}
