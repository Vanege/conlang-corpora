import { Corpus } from "../pages";

type Cell = {
  row: string;
  col: string;
  inputValue: string;
}

const formatCorpusListFromSpreadsheet = (json: any): Corpus[] => {
  const cells: Cell[] = json.feed.entry.map((e: any) => e.gs$cell)

  let data: Partial<Corpus>[] = [];
  for (const cell of cells) {
    if (cell.row === "1") {
      continue;
    }
  
    // skip if the inputValue starts with -- or // (comment)
    // ?? should not be allowed for faster formating?
    if (cell.inputValue.startsWith("//")) {
      continue;
    }
  
    const incompleteCorpus = data[parseInt(cell.row) - 1];
    if (typeof incompleteCorpus === "undefined") {
      data[parseInt(cell.row) - 1] = {};
    }

    let propertyToAdd = "???";
    switch (cell.col) {
      case "1":
        propertyToAdd = "name";
        break;
      case "2":
        propertyToAdd = "languages";
        break;
      case "3":
        propertyToAdd = "link";
        break;
      case "4":
        propertyToAdd = "source";
        break;
    }

    data[parseInt(cell.row) - 1] = {
       ...incompleteCorpus,
       [propertyToAdd]: (propertyToAdd === "languages") ? cell.inputValue.split(",") : cell.inputValue
    }
  }
  data = data.filter(c => typeof c !== "undefined");
  data = data.map((c, index) => {
    return {
      ...c,
      id: index
    }
  })
  return data as Corpus[];
}

export default formatCorpusListFromSpreadsheet;
