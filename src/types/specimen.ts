export interface Specimen {
  /** Identificador único interno */
  id: string;
  /** Número de tombo/coleta (ex: "SDR 0001") */
  collectionNumber: string;
  /** Família botânica (ex: "Bignoniaceae") */
  family: string;
  /** Nome científico em latim (ex: "Handroanthus serratifolius") */
  scientificName: string;
  /** Nome popular regional (ex: "Ipê-amarelo") */
  popularName: string;
  /** Local de coleta (ex: "Campus Bacanga, UFMA — São Luís, MA") */
  locality: string;
  /** Nome de quem realizou a coleta */
  collector: string;
  /** Laboratório, professor ou aluno contribuidor */
  contributor: string;
  /** Data da coleta no formato DD/MM/AAAA */
  date: string;
  /** Notas morfológicas ou ecológicas */
  notes: string;
  /** Caminho da foto em public/images/... ou link externo */
  imageUrl: string;
}