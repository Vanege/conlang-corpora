import { Corpus } from "../pages";

type JsonCorpus = {
  name: string;
  languages: string;
  link: string;
  source: string;
  comment: string;
}

const formatCorpusListFromSpreadsheet = (jsonCorpuses: JsonCorpus[]): Corpus[] => {
  const data = jsonCorpuses.map((jsonCorpus, index) => {
    return {
      ...jsonCorpus,
      languages: jsonCorpus.languages?.split(","),
      id: index
    }
  })
  return data as Corpus[];
}

export default formatCorpusListFromSpreadsheet;
