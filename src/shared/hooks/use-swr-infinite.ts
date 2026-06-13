import axios from "@/shared/lib/axios";
import useSWRInfiniteFetcher, { SWRInfiniteConfiguration } from "swr/infinite";
import { buildQueryParams } from "../utils/buildQueryParams";

type Meta = Record<string, any> & {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export const useSWRInfinite = (
  url: string | null,
  query?: Record<string, any>,
  opts?: SWRInfiniteConfiguration,
) => {
  // Generate SWR key for each page
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (!url) return null;

    // If no more data or invalid previous page, stop fetching
    if (previousPageData && !previousPageData.data?.data?.items?.length) {
      return null;
    }
    const params = buildQueryParams({
      ...query,
      page: (pageIndex + 1).toString(),
    });

    return `${url}?${params.toString()}`;
  };

  // Fetch paginated data
  const { data, ...rest } = useSWRInfiniteFetcher(getKey, axios.get, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateFirstPage: false,
    ...opts,
  });

  // Flatten items across all fetched pages
  const flatData = data
    ? data.flatMap((page: any) => page?.data?.data?.items || [])
    : [];

  // Get meta info from the last page
  const lastPageMeta: Meta = data?.[data.length - 1]?.data?.data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  return {
    data: flatData,
    meta: lastPageMeta,
    ...rest,
  };
};
