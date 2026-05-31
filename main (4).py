from Bio import Entrez, SeqIO
from functools import lru_cache
import io

Entrez.email = "student@university.edu"

@lru_cache(maxsize=100)
def fetch_fasta_sync(accession_id: str) -> str:
    """
    Синхронно скачивает FASTA и кэширует в оперативной памяти (до 100 запросов).
    """
    with Entrez.efetch(db="nucleotide", id=accession_id, rettype="fasta", retmode="text") as handle:
        record = SeqIO.read(handle, "fasta")
        return str(record.seq).upper()
