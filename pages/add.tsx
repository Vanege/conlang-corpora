// TODO: update page once own database, back-end and API are ready

export default function Add() {
  return (
    <div style={{ padding: "10px 10px 10px 10px" }}>
      If you want to add a corpus, follow these steps:
      <br />
      <br />
      1) Create a Google Spreadsheet document
      <br />
      <br />
      2) Each column of the spreadsheet must be associated to one (and always the same) language
      <br />
      Note: the first row, and cells beginning with // will be ignored. You can use that to leave comments in your spreadsheet.
      <br />
      Note: the first language should be located on the first column of the document.
      <br />
      Note: you are not limited to only 2 languages, you can have as many columns as languages.
      <br />
      <a href="https://docs.google.com/spreadsheets/d/1aeo2v0MG6VGSio12-t0issmL1N2DIdwG4l5GpMFBVIc/edit#gid=368641963" target="_blank" rel="noreferrer" style={{ color: "darkblue" }}>(example for Esperanto - Globasa)</a>
      <br />
      <br />
      3) <a href="https://web.archive.org/web/20210626141738/https://www.freecodecamp.org/news/cjn-google-sheets-as-json-endpoint/" target="_blank" rel="noreferrer" style={{ color: "darkblue" }}>Follow this tutorial</a>
      <br />
      (I can do the Section 4 if it is too technical for you, but be sure to finish the tutorial, Section 5 included)
      <br />
      <br />
      4) Send me a message in Discord (Vanege#7251), with
      <br />
      - The name for your corpus (it will be displayed on the website when the two languages selected are present in your corpus)
      <br />
      - The name of the languages in the order of the columns (so for the example, if the first column is in Esperanto, and the second in Globasa, message me "Esperanto - Globasa")
      <br />
      - The link to your spreadsheet document (it should start with "https://docs.google.com/spreadsheets/d/...")
      <br />
      - Eventually, the JSON url (if you managed to do the Section 4)
      <br />
      <br />
      Note that after being added, your corpus might be unlisted if I receive complaints about its content.
      <br />
      Note that userlangs (conlangs made to be learned and used) take priority over makerlangs (conlangs made for the fun of the maker).
    </div>
  )
}
