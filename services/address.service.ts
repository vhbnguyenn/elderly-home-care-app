// Address Service - Using provinces.open-api.vn API
// Documentation: https://provinces.open-api.vn/

const API_BASE_URL = 'https://provinces.open-api.vn/api';

export interface Ward {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  short_codename: string;
}

export interface District {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  short_codename: string;
  wards: Ward[];
}

export interface Province {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  phone_code: number;
  districts: District[];
}

class AddressService {
  /**
   * Get all provinces/cities
   */
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/p/`);
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      return await response.json();
    } catch (error) {
      console.error('[AddressService] Error fetching provinces:', error);
      throw error;
    }
  }

  /**
   * Get a province with all its districts and wards
   * @param provinceCode - Province code
   */
  async getProvinceDetail(provinceCode: number): Promise<Province> {
    try {
      const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=3`);
      if (!response.ok) {
        throw new Error('Failed to fetch province detail');
      }
      return await response.json();
    } catch (error) {
      console.error('[AddressService] Error fetching province detail:', error);
      throw error;
    }
  }

  /**
   * Get all districts of a province
   * @param provinceCode - Province code
   */
  async getDistricts(provinceCode: number): Promise<District[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      const province = await response.json();
      return province.districts || [];
    } catch (error) {
      console.error('[AddressService] Error fetching districts:', error);
      throw error;
    }
  }

  /**
   * Get district detail with wards
   * @param districtCode - District code
   */
  async getDistrictDetail(districtCode: number): Promise<District> {
    try {
      const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch district detail');
      }
      return await response.json();
    } catch (error) {
      console.error('[AddressService] Error fetching district detail:', error);
      throw error;
    }
  }

  /**
   * Get all wards of a district
   * @param districtCode - District code
   */
  async getWards(districtCode: number): Promise<Ward[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch wards');
      }
      const district = await response.json();
      return district.wards || [];
    } catch (error) {
      console.error('[AddressService] Error fetching wards:', error);
      throw error;
    }
  }

  /**
   * Search provinces by name
   * @param searchTerm - Search term
   */
  searchProvinces(provinces: Province[], searchTerm: string): Province[] {
    if (!searchTerm) return provinces;
    const term = searchTerm.toLowerCase();
    return provinces.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.codename.toLowerCase().includes(term)
    );
  }

  /**
   * Search districts by name
   * @param districts - Array of districts
   * @param searchTerm - Search term
   */
  searchDistricts(districts: District[], searchTerm: string): District[] {
    if (!searchTerm) return districts;
    const term = searchTerm.toLowerCase();
    return districts.filter(d => 
      d.name.toLowerCase().includes(term) ||
      d.codename.toLowerCase().includes(term)
    );
  }

  /**
   * Search wards by name
   * @param wards - Array of wards
   * @param searchTerm - Search term
   */
  searchWards(wards: Ward[], searchTerm: string): Ward[] {
    if (!searchTerm) return wards;
    const term = searchTerm.toLowerCase();
    return wards.filter(w => 
      w.name.toLowerCase().includes(term) ||
      w.codename.toLowerCase().includes(term)
    );
  }
}

export const addressService = new AddressService();


