type Cell = {
  row: string;
  col: string;
  inputValue: string;
}

const formatGoogleSpreadsheet = (json: any): string[][] => {
  const cells: Cell[] = json.feed.entry.map((e: any) => e.gs$cell)

  let data: string[][] = [];
  for (const cell of cells) {
    // skip first line
    // ?? should not be allowed for faster formating?
    if (cell.row === "1") {
      continue;
    }
  
    // skip if the inputValue starts with -- or // (comment)
    // ?? should not be allowed for faster formating?
    if (cell.inputValue.startsWith("--") || cell.inputValue.startsWith("//")) {
      continue;
    }
  
    const row = data[parseInt(cell.row) - 1];
    if (typeof row === "undefined") {
      data[parseInt(cell.row) - 1] = [];
    }
    data[parseInt(cell.row) - 1][parseInt(cell.col) - 1] = cell.inputValue;
  }
  data = data.filter(r => typeof r !== "undefined");
  return data;
}

export default formatGoogleSpreadsheet;
