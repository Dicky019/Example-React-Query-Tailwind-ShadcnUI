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
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Button } from "./components/ui/button";

type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  spinner: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};

const queryClient = new QueryClient();

export default function App() {
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
    <div className="container mx-auto my-10">
      <h1 className="text-2xl font-semibold my-2">
        Total pages {data.info.pages ?? 0}
      </h1>
      <div className="grid grid-rows-4 grid-flow-col gap-4">
        {data.results.map((user) => (
          <User caracter={user} />
        ))}
      </div>
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
    <div className="flex flex-col gap-2 my-4">
      <div>Current Page: {page + 1}</div>
      <div className="flex gap-2">
        <Button
          variant={"outline"}
          onClick={() => setPage((old) => Math.max(old - 1, 0))}
          disabled={page === 0}
        >
          {isFetching && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Previous Page
        </Button>
        <Button
          variant={"outline"}
          onClick={() => {
            setPage((old) => (hasMore ? old + 1 : old));
          }}
          disabled={isPreviousData || !hasMore}
        >
          {isFetching && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Next Page
        </Button>
      </div>
    </div>
  );
}

type UserProps = {
  caracter: Result;
};

function User({ caracter }: UserProps) {
  return (
    <Card className="p-3" key={caracter.id}>
      <div className="flex gap-2 items-center">
        <Avatar>
          <AvatarImage src={caracter.image} alt="@shadcn" />
          <AvatarFallback>{caracter.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h1>{caracter.name}</h1>
          <h1>{caracter.gender}</h1>
        </div>
      </div>
    </Card>
  );
}
