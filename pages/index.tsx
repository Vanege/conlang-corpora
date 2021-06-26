import { useState, useEffect, useMemo } from 'react';
import Select from '../components/Select';
import Checkbox from '../components/Checkbox';
import TextInput from '../components/TextInput';
import Row from '../components/Row';
import { isDefined, isString } from '../utils/type-guards';
import { useRouter } from 'next/router';
import formatGoogleSpreadsheet from '../utils/formatGoogleSpreadsheet';

type Corpus = {
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
      const res = await fetch('/corpuses.json')
      const json = await res.json();
      setCorpuses(json);
    }
    fetchCorpuses();
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

  // at first render, set l1 and l2 using the query string
  // keep the state in sync with the query string
  useEffect(() => {
    console.log("query changed!")
    const params = new URLSearchParams(window.location.search);
    setL1(params.get("l1"));
    setL2(params.get("l2"));
    const selectedCorpusIdsJSON = params.get("selectedCorpusIds") ?? "[]";
    console.log("a")
    setSelectedCorpusIds(JSON.parse(selectedCorpusIdsJSON));
    console.log("b")
    setSearch(params.get("search"));
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
  }

  const [rowsFilteredBySearch, setRowsFilteredBySearch] = useState<string[][]>([]);
  useEffect(() => {
    let rowsFilteredBySearch: string[][] = [];
    if (!isDefined(search) || search.length < 3) {
      setRowsFilteredBySearch([]);
      return;
    }
    rowsFilteredBySearch = rows.filter(row => (row[0].toLowerCase()).includes(search.toLowerCase()))
    setRowsFilteredBySearch(rowsFilteredBySearch);
  }, [rows, search]);

  return (
    <div style={{display: "flex", flexDirection: "column", margin: "5px 5px 5px 5px"}}>
      <div style={{display: "flex"}}>
        <Select value={l1} items={l1List} onChange={changeL1} placeholder={"Language 1"}/>
        <div className="switch" onClick={switchLanguages}>↔</div>
        <Select value={l2} items={l2List} onChange={changeL2} placeholder={"Language 2"}/>
      </div>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <div style={{display: "flex", minHeight: "20px"}}>
          { selectableCorpuses.length === 0 && "Select languages to see the list of corpuses" }
          { selectableCorpuses.length !== 0 && selectableCorpuses.map(sC =>
              <>
                <Checkbox value={selectedCorpusIds.includes(sC.id)} label={sC.name} onChange={() => selectCorpusId(sC)} key={sC.id} />
                {
                  isDefined(sC.source) && 
                  <>
                    &nbsp;
                    <a href={sC.source} target="_blank" rel="noreferrer" style={{color: "darkblue"}}>(link)</a>
                  </>
                }
              </>
            )
          }
        </div>
        { rows.length > 0 && <div>Loaded rows: {rows.length}</div> }
      </div>
      <TextInput value={search} onChange={changeSearch} placeholder="Type substring to search (at least 3 characters)" />
      <div style={{display: "flex", flexDirection: "column" }}>
        { rowsFilteredBySearch.map((row, index) => index < 30 && <Row row={row} key={index} />)}
      </div>

      <style jsx>{`
        .switch {
          cursor: pointer;
          border-radius: 5px;
          border: lightgray solid 1px;
        }
      `}</style>
    </div>
  )
}