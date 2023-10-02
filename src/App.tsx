function App() {
  return (
    <>
      <div className="">Tes Api</div>
      <TesApi />
    </>
  );
}

export default App;

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import axios from "axios";
import { Characters, Result } from "@/types/data";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function TesApi() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

async function fetchProjects(page = 0): Promise<Characters> {
  const { data } = await axios.get(
    "https://rickandmortyapi.com/api/character/?page=" + page
  );
  return data;
}

function Example() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isFetching, isLoading, isError, isPreviousData } = useQuery({
    queryKey: ["projects", page],
    queryFn: () => fetchProjects(page),
    keepPreviousData: true,
  });

  // Prefetch the next page!
  useEffect(() => {
    if (!isPreviousData && data?.info.next) {
      queryClient.prefetchQuery({
        queryKey: ["projects", page + 1],
        queryFn: () => fetchProjects(page + 1),
      });
    }
  }, [data, isPreviousData, page, queryClient]);

  if (isLoading) {
    return "Loading...";
  }
  if (isError) {
    return "Error...";
  }

  return (
    <div>
      <h1>Total {data.info.pages ?? 0}</h1>
      {data.results.map((user) => (
        <User caracter={user} />
      ))}
      <div className="mx-2">{isFetching ? "Updating..." : ""}</div>
      <Pagination
        hasMore={data.info.next !== null}
        isFetching={isFetching}
        isPreviousData={isPreviousData}
        page={page}
        setPage={setPage}
      />
      <ReactQueryDevtools initialIsOpen />
    </div>
  );
}

interface PaginationProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  isPreviousData: boolean;
  hasMore: boolean;
  isFetching: boolean;
}

function Pagination({
  page,
  setPage,
  isPreviousData,
  hasMore,
  isFetching,
}: PaginationProps) {
  return (
    <>
      <div>Current Page: {page + 1}</div>
      <button
        onClick={() => setPage((old) => Math.max(old - 1, 0))}
        disabled={page === 0}
      >
        Previous Page
      </button>{" "}
      <button
        onClick={() => {
          setPage((old) => (hasMore ? old + 1 : old));
        }}
        disabled={isPreviousData || !hasMore}
      >
        Next Page
      </button>
      {
        // Since the last page's data potentially sticks around between page requests,
        // we can use `isFetching` to show a background loading
        // indicator since our `status === 'loading'` state won't be triggered
        isFetching ? <span> Loading...</span> : null
      }{" "}
    </>
  );
}

type UserProps = {
  caracter: Result;
};

function User({ caracter }: UserProps) {
  return (
    <div key={caracter.id}>
      <img src={caracter.image} alt="Avatar" />
      <h1>{caracter.name}</h1>
      <h1>{caracter.gender}</h1>
    </div>
  );
}
