export interface SimulationRequest {
  accession_id: string;
  dna_concentration: number;
}

export interface CurvePoint {
  temperature: number;
  fraction_unfolded: number;
}

export interface SimulationResponse {
  accession_id: string;
  length: number;
  gc_percent: number;
  tm_celsius: number;
  curve: CurvePoint[];
}
