import { useMemo } from "react";

export default function Row({ row, search } : { row: string[], search: string }) {

  const indexOfSearchMatch = useMemo<number>(() => {
    return (row[0].toLowerCase()).indexOf(search.toLowerCase());
  }, [row, search]);

  const l1rowStart = useMemo<string>(() => {
    return row[0].substring(0, indexOfSearchMatch);
  }, [row, indexOfSearchMatch]);

  const l1rowCenter = useMemo<string>(() => {
    return row[0].substring(indexOfSearchMatch, indexOfSearchMatch + search.length);
  }, [row, indexOfSearchMatch, search]);

  const l1rowEnd = useMemo<string>(() => {
    return row[0].substring(indexOfSearchMatch + search.length, row[0].length); 
  }, [row, indexOfSearchMatch, search]);

  return (<>
    <div className="row-container">
      <div className="row-l1-wrapper">{l1rowStart}<span style={{textDecoration: "underline"}}>{l1rowCenter}</span>{l1rowEnd}</div>
      <div className="row-l2-wrapper">{row[1]}</div>
    </div>

    {/* How often is this style duplicated? */}
    <style jsx>
      {`
        .row-container {
          display: flex;
          flex-direction: column;
          margin-top: 10px;
        }

        .row-l1-wrapper {}

        .row-l2-wrapper {
          color: #626262;
        }
      `}
    </style>
  </>)
}