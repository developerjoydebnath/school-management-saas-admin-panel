import {
    PaginationState,
    RowSelectionState,
    SortingState,
} from '@tanstack/react-table';
import { produce } from 'immer';
import { create, StoreApi, UseBoundStore } from 'zustand';

// Table state type
export type TableState = {
    pagination: PaginationState;
    sorting: SortingState;
    globalFilter: string;
    columnOrder: string[];
    rowSelection: RowSelectionState;
    columnVisibility: Record<string, boolean>;
};

// Unified store type
export type UnifiedStore<TFilters extends Record<string, unknown>> = {
    filters: TFilters;
    tableState: TableState;

    // Filter & Location
    setFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
    resetFilters: (skip?: (keyof TFilters)[]) => void;

    // Table state
    setTableState: (
        updater: TableState | ((prev: TableState) => TableState),
    ) => void;
    setInitialColumnOrder: (columnOrder: string[]) => void;
    setColumnOrder: (
        updater: string[] | ((prevOrder: string[]) => string[]),
    ) => void;
    setColumnVisibility: (
        updater:
            | Record<string, boolean>
            | ((
                  prevVisibility: Record<string, boolean>,
              ) => Record<string, boolean>),
    ) => void;
};

export const createUnifiedStore = <TFilters extends Record<string, unknown>>(
    initialFilters: TFilters = {} as TFilters,
): UseBoundStore<StoreApi<UnifiedStore<TFilters>>> => {
    return create<UnifiedStore<TFilters>>()(set => ({
        filters: initialFilters,
        tableState: {
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [],
            globalFilter: '',
            columnOrder: [],
            rowSelection: {},
            columnVisibility: {},
        },

        setFilter: (key, value) =>
            set(
                produce(state => {
                    state.filters[key] = value;
                    state.tableState.pagination.pageIndex = 0;
                }),
            ),

        resetFilters: skip =>
            set(
                produce(state => {
                    const newFilters = { ...initialFilters };
                    if (skip) {
                        skip.forEach(key => {
                            newFilters[key] = state.filters[key];
                        });
                    }

                    state.filters = newFilters;

                    state.tableState = {
                        pagination: { pageIndex: 0, pageSize: 10 },
                        sorting: [],
                        globalFilter: '',
                        columnOrder: [],
                        rowSelection: {},
                    };
                }),
            ),

        setTableState: updater =>
            set(
                produce(state => {
                    state.tableState =
                        typeof updater === 'function'
                            ? updater(state.tableState)
                            : updater;
                }),
            ),

        setInitialColumnOrder: columnOrder =>
            set(
                produce(state => {
                    state.tableState.columnOrder = columnOrder;
                }),
            ),

        setColumnOrder: updater =>
            set(
                produce(state => {
                    const currentOrder = state.tableState.columnOrder;
                    state.tableState.columnOrder =
                        typeof updater === 'function'
                            ? updater(currentOrder)
                            : updater;
                }),
            ),

        setColumnVisibility: updater =>
            set(
                produce(state => {
                    const currentVisibility = state.tableState.columnVisibility;
                    state.tableState.columnVisibility =
                        typeof updater === 'function'
                            ? updater(currentVisibility)
                            : updater;
                }),
            ),
    }));
};
