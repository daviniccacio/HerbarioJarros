export interface Specimen {
  /** Identificador único interno (ex: "hsrd-0001") */
  id: string;
  /** Número de tombo/coleta (ex: "HSRD 0001") */
  collectionNumber: string;
  /** Família botânica (ex: "Rubiaceae") */
  family: string;
  /** Nome científico em latim — opcional enquanto estiver em identificação */
  scientificName?: string;
  /** Nome popular regional (ex: "Ixória, Flor-de-coral") */
  popularName: string;
  /** Local de coleta */
  locality: string;
  /** Nome de quem realizou a coleta */
  collector: string;
  /** Acompanhante(s) da coleta — opcional */
  contributor?: string;
  /** Data da coleta no formato DD/MM/AAAA */
  date: string;
  /** Notas morfológicas ou ecológicas */
  notes: string;
  /** Caminho da foto em public/images/... */
  imageUrl: string;
}