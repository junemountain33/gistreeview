export interface TreeData {
  id: string;
  latitude: number;
  longitude: number;
  species: string;
  age: number;
  trunk_diameter: number;
  lbranch_width: number;
  ownership: string;
  street_name: string;
  description: string;
  status: string;
  timestamp: number;
  roadId?: string;
}

export interface TreePicture {
  id: string;
  url: string;
  treeId: string;
  uploaded: string;
}
