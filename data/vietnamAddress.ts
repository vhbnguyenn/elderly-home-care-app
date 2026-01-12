export interface Ward {
  name: string;
  code: string;
}

export interface District {
  name: string;
  code: string;
  wards: Ward[];
}

export interface Province {
  name: string;
  code: string;
  districts: District[];
}

export const vietnamProvinces: Province[] = [
  {
    name: "TP. Hồ Chí Minh",
    code: "79",
    districts: [
      {
        name: "Quận 1",
        code: "760",
        wards: [
          { name: "Phường Tân Định", code: "26734" },
          { name: "Phường Đa Kao", code: "26737" },
          { name: "Phường Bến Nghé", code: "26740" },
          { name: "Phường Bến Thành", code: "26743" },
          { name: "Phường Nguyễn Thái Bình", code: "26746" },
          { name: "Phường Phạm Ngũ Lão", code: "26749" },
          { name: "Phường Cầu Ông Lãnh", code: "26752" },
          { name: "Phường Cô Giang", code: "26755" },
          { name: "Phường Nguyễn Cư Trinh", code: "26758" },
          { name: "Phường Cầu Kho", code: "26761" },
        ]
      },
      {
        name: "Quận 3",
        code: "770",
        wards: [
          { name: "Phường 1", code: "27127" },
          { name: "Phường 2", code: "27130" },
          { name: "Phường 3", code: "27133" },
          { name: "Phường 4", code: "27136" },
          { name: "Phường 5", code: "27139" },
          { name: "Phường 6", code: "27142" },
          { name: "Phường 7", code: "27145" },
          { name: "Phường 8", code: "27148" },
          { name: "Phường 9", code: "27151" },
          { name: "Phường 10", code: "27154" },
        ]
      },
      {
        name: "Quận 7",
        code: "774",
        wards: [
          { name: "Phường Tân Thuận Đông", code: "27259" },
          { name: "Phường Tân Thuận Tây", code: "27262" },
          { name: "Phường Tân Kiểng", code: "27265" },
          { name: "Phường Tân Hưng", code: "27268" },
          { name: "Phường Bình Thuận", code: "27271" },
          { name: "Phường Tân Quy", code: "27274" },
          { name: "Phường Phú Thuận", code: "27277" },
          { name: "Phường Tân Phú", code: "27280" },
          { name: "Phường Tân Phong", code: "27283" },
          { name: "Phường Phú Mỹ", code: "27286" },
        ]
      },
      {
        name: "Quận Bình Thạnh",
        code: "765",
        wards: [
          { name: "Phường 1", code: "26836" },
          { name: "Phường 2", code: "26839" },
          { name: "Phường 3", code: "26842" },
          { name: "Phường 5", code: "26845" },
          { name: "Phường 6", code: "26848" },
          { name: "Phường 7", code: "26851" },
          { name: "Phường 11", code: "26854" },
          { name: "Phường 12", code: "26857" },
          { name: "Phường 13", code: "26860" },
          { name: "Phường 14", code: "26863" },
        ]
      },
      {
        name: "Quận Tân Bình",
        code: "766",
        wards: [
          { name: "Phường 1", code: "26866" },
          { name: "Phường 2", code: "26869" },
          { name: "Phường 3", code: "26872" },
          { name: "Phường 4", code: "26875" },
          { name: "Phường 5", code: "26878" },
          { name: "Phường 6", code: "26881" },
          { name: "Phường 7", code: "26884" },
          { name: "Phường 8", code: "26887" },
          { name: "Phường 10", code: "26890" },
          { name: "Phường 11", code: "26893" },
        ]
      },
    ]
  },
  {
    name: "TP. Hà Nội",
    code: "01",
    districts: [
      {
        name: "Quận Ba Đình",
        code: "001",
        wards: [
          { name: "Phường Phúc Xá", code: "00001" },
          { name: "Phường Trúc Bạch", code: "00004" },
          { name: "Phường Vĩnh Phúc", code: "00006" },
          { name: "Phường Cống Vị", code: "00007" },
          { name: "Phường Liễu Giai", code: "00008" },
          { name: "Phường Nguyễn Trung Trực", code: "00010" },
          { name: "Phường Quán Thánh", code: "00013" },
          { name: "Phường Ngọc Hà", code: "00016" },
          { name: "Phường Điện Biên", code: "00019" },
          { name: "Phường Đội Cấn", code: "00022" },
        ]
      },
      {
        name: "Quận Hoàn Kiếm",
        code: "002",
        wards: [
          { name: "Phường Phúc Tân", code: "00025" },
          { name: "Phường Đồng Xuân", code: "00028" },
          { name: "Phường Hàng Mã", code: "00031" },
          { name: "Phường Hàng Buồm", code: "00034" },
          { name: "Phường Hàng Đào", code: "00037" },
          { name: "Phường Hàng Bồ", code: "00040" },
          { name: "Phường Cửa Đông", code: "00043" },
          { name: "Phường Lý Thái Tổ", code: "00046" },
          { name: "Phường Hàng Bạc", code: "00049" },
          { name: "Phường Hàng Gai", code: "00052" },
        ]
      },
      {
        name: "Quận Cầu Giấy",
        code: "005",
        wards: [
          { name: "Phường Nghĩa Đô", code: "00154" },
          { name: "Phường Nghĩa Tân", code: "00157" },
          { name: "Phường Mai Dịch", code: "00160" },
          { name: "Phường Dịch Vọng", code: "00163" },
          { name: "Phường Dịch Vọng Hậu", code: "00166" },
          { name: "Phường Quan Hoa", code: "00167" },
          { name: "Phường Yên Hoà", code: "00169" },
          { name: "Phường Trung Hoà", code: "00172" },
        ]
      },
    ]
  },
  {
    name: "TP. Đà Nẵng",
    code: "48",
    districts: [
      {
        name: "Quận Hải Châu",
        code: "490",
        wards: [
          { name: "Phường Thanh Bình", code: "20194" },
          { name: "Phường Thuận Phước", code: "20195" },
          { name: "Phường Thạch Thang", code: "20197" },
          { name: "Phường Hải Châu I", code: "20198" },
          { name: "Phường Hải Châu II", code: "20200" },
          { name: "Phường Phước Ninh", code: "20203" },
          { name: "Phường Hòa Thuận Tây", code: "20206" },
          { name: "Phường Hòa Thuận Đông", code: "20207" },
        ]
      },
      {
        name: "Quận Thanh Khê",
        code: "491",
        wards: [
          { name: "Phường Tam Thuận", code: "20209" },
          { name: "Phường Thanh Khê Tây", code: "20212" },
          { name: "Phường Thanh Khê Đông", code: "20215" },
          { name: "Phường Xuân Hà", code: "20218" },
          { name: "Phường Tân Chính", code: "20221" },
          { name: "Phường Chính Gián", code: "20224" },
          { name: "Phường Vĩnh Trung", code: "20227" },
          { name: "Phường Thạc Gián", code: "20230" },
        ]
      },
    ]
  },
  {
    name: "TP. Cần Thơ",
    code: "92",
    districts: [
      {
        name: "Quận Ninh Kiều",
        code: "916",
        wards: [
          { name: "Phường Cái Khế", code: "31117" },
          { name: "Phường An Hòa", code: "31120" },
          { name: "Phường Thới Bình", code: "31123" },
          { name: "Phường An Nghiệp", code: "31126" },
          { name: "Phường An Cư", code: "31129" },
          { name: "Phường An Phú", code: "31132" },
          { name: "Phường Xuân Khánh", code: "31135" },
          { name: "Phường Hưng Lợi", code: "31138" },
        ]
      },
    ]
  },
];
