type Cell = {
  row: string;
  col: string;
  inputValue: string;
}

const formatGoogleSpreadsheet = (json: any): string[][] => {
  const cells: Cell[] = json.feed.entry.map((e: any) => e.gs$cell)

  let data: any[][] = [];
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

  // remove empty rows
  data = data.filter(r => typeof r !== "undefined");

  // make sure every row has the same length
  // fill empty cells with ""
  let numberOfColumns = -1;
  for (const row of data) {
    if (row.length > numberOfColumns) {
      numberOfColumns = row.length;
    }
  }
  for (const rowIndex in data) {
    const row = data[rowIndex];
    row.length = numberOfColumns;
    // replace empty slots with undefined so .map can work on them
    let newRow = [...row];
    newRow = newRow.map(cell => cell ?? "")
    data[rowIndex] = newRow;
  }

  return data as string[][];
}

export default formatGoogleSpreadsheet;
