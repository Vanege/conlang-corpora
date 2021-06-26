export default function Row({ row } :
  { row: string[] }) {

  return (<>
    <div className="row-container">
      <div className="row-l1-wrapper">{row[0]}</div>
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