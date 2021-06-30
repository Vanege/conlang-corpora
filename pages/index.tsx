import { useState, useEffect, useMemo } from 'react';
import Select from '../components/Select';
import Checkbox from '../components/Checkbox';
import TextInput from '../components/TextInput';
import Row from '../components/Row';
import { isDefined, isString } from '../utils/type-guards';
import { useRouter } from 'next/router';
import formatGoogleSpreadsheet from '../utils/formatGoogleSpreadsheet';
import formatCorpusListFromSpreadsheet from '../utils/formatCorpusListFromSpreadsheet';

export type Corpus = {
  id: number
  name: string;
  languages: string[];
  link: string;
  source?: string;
}

type FetchedCorpus = Corpus & {
  // if corpus.languages is ["english", "esperanto"], then data[x][0] is in english, data[x][1] is in esperanto
  data: string[][];
}

export default function Home() {
  const router = useRouter();

  const [corpuses, setCorpuses] = useState<Corpus[]>([]);
  useEffect(() => {
    const fetchCorpuses = async () => {
      const res = await fetch(`https://spreadsheets.google.com/feeds/cells/1aeo2v0MG6VGSio12-t0issmL1N2DIdwG4l5GpMFBVIc/9/public/full?alt=json`)
      let data = await res.json();
      data = formatCorpusListFromSpreadsheet(data);
      setCorpuses(data);
    }
    fetchCorpuses();
    // prefill the search with the one in the query string
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("search"));
  }, []);

  const l1List = useMemo<string[]>(() => {
    const list: string[] = [];
    for (const corpus of corpuses) {
      for (const language of corpus.languages) {
        if (!list.includes(language)) {
          list.push(language);
        }
      }
    }
    return list
  }, [corpuses]);
  const [l1, setL1] = useState<string | null>("");

  const l2List = useMemo<string[]>(() => {
    const list: string[] = [];
    for (const corpus of corpuses) {
      if (corpus.languages.includes(l1 ?? "")) {
        for (const language of corpus.languages) {
          if (!list.includes(language) && language !== l1) {
            list.push(language);
          }
        }
      }
    }
    return list
  }, [corpuses, l1]);
  const [l2, setL2] = useState<string | null>("");

  // keep the state in sync with the query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setL1(params.get("l1"));
    setL2(params.get("l2"));
    const selectedCorpusIdsJSON = params.get("selectedCorpusIds") ?? "[]";
    setSelectedCorpusIds(JSON.parse(selectedCorpusIdsJSON));
    // we can't use the query string as the source of truth for the search
    // because it takes too much time to update on mobile
    // setSearch(params.get("search"));
  }, [router.query]);

  const changeL1 = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("l1", value);
    params.set("l2", "");
    router.push({query: params.toString()}, undefined, { shallow: true });
  }

  const changeL2 = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("l2", value);
    router.push({query: params.toString()}, undefined, { shallow: true });
  }

  const switchLanguages = async () => {
    if (isString(l1) && l1.length > 0 && isString(l2) && l2.length > 0) {
      const oldL1 = l1;
      const oldL2 = l2;
      const params = new URLSearchParams(window.location.search);
      params.set("l1", oldL2);
      params.set("l2", oldL1);
      router.push({query: params.toString()}, undefined, { shallow: true });
    }
  }

  const selectableCorpuses = useMemo<Corpus[]>(() => {
    return corpuses.filter(corpus => {
      return corpus.languages.includes(l1 ?? "") && corpus.languages.includes(l2 ?? "");
    })
  }, [corpuses, l1, l2]);

  const [selectedCorpusIds, setSelectedCorpusIds] = useState<number[]>([]);
  
  const selectCorpusId = (newlySelectedCorpus: Corpus) => {
    const newlySelectedCorpusId: number = newlySelectedCorpus.id;
    // if the corpus was already selected, remove it from the list
    if (selectedCorpusIds.includes(newlySelectedCorpusId)) {
      const newSelectedCorpusIds = selectedCorpusIds.filter(id => id !== newlySelectedCorpusId);
      const params = new URLSearchParams(window.location.search);
      params.set("selectedCorpusIds", JSON.stringify(newSelectedCorpusIds));
      router.push({query: params.toString()}, undefined, { shallow: true });
    } else {
      const params = new URLSearchParams(window.location.search);
      params.set("selectedCorpusIds", JSON.stringify([...selectedCorpusIds, newlySelectedCorpusId]));
      router.push({query: params.toString()}, undefined, { shallow: true });
    }
  }

  const selectedCorpuses = useMemo<Corpus[]>(() => {
    return selectableCorpuses.filter(corpus => selectedCorpusIds.includes(corpus.id));
  }, [selectableCorpuses, selectedCorpusIds]);


  // by default, select all corpuses that are available for the combination of l1 and l2
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectableCorpuses.length > 0 && params.get("selectedCorpusIds") === null)
    params.set("selectedCorpusIds", JSON.stringify(selectableCorpuses.map(sC => sC.id)));
    router.push({query: params.toString()}, undefined, { shallow: true });
  }, [selectableCorpuses]);

  const [fetchedCorpuses, setFetchedCorpuses] = useState<FetchedCorpus[]>([]);
  // fetch selected corpuses that are not already fetched
  useEffect(() => {
    const fetchCorpuses = async () => {
      for (const selectedCorpus of selectedCorpuses) {
        if (!fetchedCorpuses.map(fC => fC.id).includes(selectedCorpus.id)) {
          const res = await fetch(`${selectedCorpus.link}`)
          let data = await res.json();

          if (selectedCorpus.link.includes("spreadsheets.google.com")) {
            data = formatGoogleSpreadsheet(data);
          }

          const newFetchedCorpus = {
            ...selectedCorpus,
            data
          }
          setFetchedCorpuses([...fetchedCorpuses, newFetchedCorpus])
        }
      }
    }
    fetchCorpuses();
  }, [selectedCorpuses, fetchedCorpuses]);

  // rows: [["l1", "l2"], ["l1", "l2"], ...]
  const [rows, setRows] = useState<string[][]>([]);
  useEffect(() => {
    const data: string[][] = [];

    for (const selectedCorpus of selectedCorpuses) {
      const matchingFetchedCorpus = fetchedCorpuses.find(fC => fC.id === selectedCorpus.id);
      if (!isDefined(matchingFetchedCorpus)) {
        continue;
      }
      const indexOfL1 = matchingFetchedCorpus.languages.indexOf(l1 ?? "");
      const indexOfL2 = matchingFetchedCorpus.languages.indexOf(l2 ?? "");
      if (indexOfL1 === -1 || indexOfL2 === -1) {
        continue;
      }
      const matchingData = matchingFetchedCorpus.data;
      const dataForThisCorpus: string[][] = matchingData.map(row => {
        return [row[indexOfL1], row[indexOfL2]];
      })
      data.push(...dataForThisCorpus);
    }

    // order the data by putting short strings in l1 first
    const sortedData = data.sort((a, b) => a[0].length - b[0].length);
    setRows(sortedData);
  }, [fetchedCorpuses, l1, l2, selectedCorpuses]);

  const [search, setSearch] = useState<string | null>(null);
  
  const changeSearch = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("search", value);
    router.push({query: params.toString()}, undefined, { shallow: true });
    setSearch(value)
  }

  const [rowsFilteredBySearch, setRowsFilteredBySearch] = useState<string[][]>([]);
  useEffect(() => {
    let rowsFilteredBySearch: string[][] = [];
    // should try to match rows only if at least 3 characters are typed
    if (!isDefined(search) || search.length < 3) {
      setRowsFilteredBySearch([]);
      return;
    }
    // ignore casing
    rowsFilteredBySearch = rows.filter(row => (row[0].toLowerCase()).includes(search.toLowerCase()))
    // exclude rows with missing data
    rowsFilteredBySearch = rowsFilteredBySearch.filter(row => { return row[0] !== "" && row[1] !== "" })
    setRowsFilteredBySearch(rowsFilteredBySearch);
  }, [rows, search]);

  return (
    <div className="container">
      <div style={{display: "flex"}}>
        <Select value={l1} items={l1List} onChange={changeL1} placeholder={"Language 1"}/>
        <div className="switch" onClick={switchLanguages}>↔</div>
        <Select value={l2} items={l2List} onChange={changeL2} placeholder={"Language 2"}/>
        <a className="switch" href="/add" target="_blank" rel="noreferrer">+</a>
      </div>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <div style={{display: "flex", minHeight: "20px"}}>
          { selectableCorpuses.length === 0 && "Select languages to see the list of corpuses" }
          { selectableCorpuses.length !== 0 && selectableCorpuses.map(sC =>
              <div key={sC.id} style={{display: "flex"}}>
                <Checkbox value={selectedCorpusIds.includes(sC.id)} label={sC.name} onChange={() => selectCorpusId(sC)} />
                {
                  isDefined(sC.source) && 
                  <>
                    &nbsp;
                    <a href={sC.source} target="_blank" rel="noreferrer" style={{color: "darkblue"}}>(link)</a>
                  </>
                }
              </div>
            )
          }
        </div>
        { selectedCorpusIds.length > 0 && rows.length === 0 && <div>Loading rows, please wait...</div> }
        { rows.length > 0 && <div>Rows loaded: {rows.length}</div> }
      </div>
      <div style={{display: "flex"}}>
        <TextInput value={search} onChange={changeSearch} placeholder="Type at least 3 characters" />
        <input onClick={() => changeSearch("")} type="reset" value="Reset"/>
      </div>
      <div style={{display: "flex", flexDirection: "column" }}>
        { rowsFilteredBySearch.map((row, index) => index < 30 && <Row row={row} search={search ?? ""} key={index} />)}
      </div>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          margin: 0 10px 10px 10px;
        }
        .container > * {
          margin-top: 10px;
        }
        .switch {
          cursor: pointer;
          border-radius: 5px;
          border: lightgray solid 1px;
          min-width: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  )
}
