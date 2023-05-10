import "./App.css";
import fakeData from "./MOCK_DATA.json";
import * as React from "react";
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
function App() {
  const [sorting, setSorting] = React.useState([]);
  const data = React.useMemo(() => {
    if (sorting.length > 0) {return sorting;}
    return fakeData;
  }, [sorting]);
  const [pages, setPages] = React.useState(0);
  const columns = React.useMemo(
    () => [
      {
        Header: "Mission Name",
        accessor: "mission_name"
      },
      {
        Header: "Rocket Name",
        accessor: "rocket_name"
      },
      {
        Header: "Rocket Type",
        accessor: "rocket_type"
      },
      {
        Header: "Launch Date",
        accessor: "launch_date"
      },
    ],
    []
  );
  React.useEffect(()=> {
    fetch('https://api.spacexdata.com/v2/launches')
    .then(response => response.json())
    .then(cells => {
      let cell = cells.map((e) => {
        const date = new Date(e.launch_date_local);
        const year = date.getFullYear();
        const month = `${(date.getMonth() + 1)}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        const dateString = `${year}/${month}/${day}`;

        return {
        "mission_name": e.mission_name,
        "rocket_name": e.rocket.rocket_name,
        "rocket_type": e.rocket.rocket_type,
        "launch_date": dateString
        }});
      setSorting(cell);
    })
    .catch(error => console.error(error));
  }, [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,

    setGlobalFilter,
    state: { globalFilter },

    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex },
  } = useTable(
    { columns, data },
    useGlobalFilter,
    useSortBy,
    usePagination,
  )
  ///
  React.useEffect(()=> {
    setPageSize(20);
    setPages(pageIndex);
  }, [pageIndex])

  return (
    <div className="App">
      <div className="container">
        {/* <Pagination table={table} /> */}
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>{pageIndex + 1} of {pageCount}</strong>{' '}
        </span>
        <input
          value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
        />
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  {column.isSorted
                    ? column.isSortedDesc
                      ? ' 🔽'
                      : ' 🔼'
                    : ''}
                </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.slice(pages * 20, pages * 20 + 20).map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}> {cell.render("Cell")} </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
