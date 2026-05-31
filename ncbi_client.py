from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from thermo_model import calculate_tm_and_curve
from ncbi_client import fetch_fasta_sync

app = FastAPI(title="DNA Thermal Simulator - Lightweight")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_NUCLEOTIDES = frozenset("ATGCNRYWSMKHBVD")

class SimulationRequest(BaseModel):
    accession_id: str
    dna_concentration: float = 5e-5

    @field_validator("dna_concentration")
    @classmethod
    def concentration_must_be_positive(cls, v: float) -> float:
        if v <= 0 or v > 1.0:
            raise ValueError("Концентрация ДНК должна быть в диапазоне (0, 1] моль/л")
        return v

    @field_validator("accession_id")
    @classmethod
    def accession_id_must_not_be_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Accession ID не может быть пустым")
        return v

@app.post("/api/simulate")
def run_simulation(req: SimulationRequest):
    try:
        sequence = fetch_fasta_sync(req.accession_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"NCBI Fetch Error: {str(e)}")

    if not sequence:
        raise HTTPException(status_code=422, detail="Получена пустая последовательность из NCBI")

    invalid_chars = set(sequence) - VALID_NUCLEOTIDES
    if invalid_chars:
        raise HTTPException(
            status_code=422,
            detail=f"Последовательность содержит недопустимые символы: {', '.join(sorted(invalid_chars))}"
        )

    tm, curve = calculate_tm_and_curve(sequence, req.dna_concentration)
    gc_count = sequence.count('G') + sequence.count('C')
    gc_percent = round((gc_count / len(sequence)) * 100, 2)

    return {
        "accession_id": req.accession_id,
        "length": len(sequence),
        "gc_percent": gc_percent,
        "tm_celsius": tm,
        "curve": curve
    }
