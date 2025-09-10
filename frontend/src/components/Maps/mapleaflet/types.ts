export interface Road {
  id: string;
  name?: string;
  geometry: {
    coordinates: number[][];
  };
}

export interface TreePicture {
  id: string;
  url: string;
  treeId: string;
}

export interface TreeData {
  id: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  status: "good" | "warning" | "danger";
}
