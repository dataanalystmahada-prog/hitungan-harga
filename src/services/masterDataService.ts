import { MasterDataRepository } from '../repositories/masterDataRepository';
import { 
  MasterProduk, ModalProduk, ModalLogo, Margin, Brand, UserSales, Divisi, Keterangan, PromptLibrary 
} from '../types/database.types';

export class MasterDataService {
  public static async getMasterProduk(): Promise<MasterProduk[]> {
    return MasterDataRepository.getMasterProduk();
  }

  public static async getModalProduk(): Promise<ModalProduk[]> {
    return MasterDataRepository.getModalProduk();
  }

  public static async getModalLogo(): Promise<ModalLogo[]> {
    return MasterDataRepository.getModalLogo();
  }

  public static async getMargin(): Promise<Margin[]> {
    return MasterDataRepository.getMargin();
  }

  public static async getBrands(): Promise<Brand[]> {
    return MasterDataRepository.getBrands();
  }

  public static async getUsers(): Promise<UserSales[]> {
    return MasterDataRepository.getUsers();
  }

  public static async getDivisi(): Promise<Divisi[]> {
    return MasterDataRepository.getDivisi();
  }

  public static async getKeterangan(): Promise<Keterangan[]> {
    return MasterDataRepository.getKeterangan();
  }

  public static async getPromptLibrary(): Promise<PromptLibrary[]> {
    return MasterDataRepository.getPromptLibrary();
  }

  /**
   * Fetches all master lookup tables simultaneously with cache
   */
  public static async getAllMasterData() {
    const [
      masterProduk,
      modalProduk,
      modalLogo,
      margin,
      brands,
      users,
      divisi,
      keterangan,
      prompts,
    ] = await Promise.all([
      this.getMasterProduk(),
      this.getModalProduk(),
      this.getModalLogo(),
      this.getMargin(),
      this.getBrands(),
      this.getUsers(),
      this.getDivisi(),
      this.getKeterangan(),
      this.getPromptLibrary(),
    ]);

    return {
      masterProduk,
      modalProduk,
      modalLogo,
      margin,
      brands,
      users,
      divisi,
      keterangan,
      prompts,
    };
  }
}
