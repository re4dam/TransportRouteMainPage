// ==========================================
// VEHICLE INTERFACES
// ==========================================

export interface VehicleResponse {
  id: number;
  vehicleName: string;
  categoryName: string;
  routeName: string;
}

export interface VehicleRequest {
  vehicleName: string;
  categoryId: number;
  transitRouteId: number;
}

// ==========================================
// CATEGORY INTERFACES
// ==========================================

export interface CategoryResponse {
  id: number;
  categoryName: string;
  // Notice how it neatly imports the VehicleResponse array!
  vehicles: VehicleResponse[]; 
}

export interface CategoryRequest {
  categoryName: string;
}

// ==========================================
// TRANSIT ROUTE INTERFACES
// ==========================================

export interface TransitRouteResponse {
  id: number;
  routeName: string;
  startingPoint: string;
  destination: string;
  startingHour: string; // Assuming C# TimeSpan/TimeOnly comes over as a string
  endingHour: string;
  vehicles: VehicleResponse[];
}

export interface TransitRouteRequest {
  routeName: string;
  startingPoint: string;
  destination: string;
  startingHour: string;
  endingHour: string;
}