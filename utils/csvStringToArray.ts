const csvStringToArray = (csvString: string, delimiter: string): Object[] => {
  const headers = csvString.slice(0, csvString.indexOf("\n")).split(delimiter);
  const stringWithoutHeaders = csvString.slice(csvString.indexOf("\n") + 1);
  const rows = stringWithoutHeaders.split("\n");
  const array = rows.map(row => {
    const values = row.split(delimiter);
    const object: {[key: string]: string } = {};
    for (const index in headers) {
      const header = headers[index];
      object[header] = values?.[index] ?? "";
    }
    return object;
  })
  return array;
}

export default csvStringToArray;