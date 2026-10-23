export interface FilePattern {
    name: string,
    content: string | ArrayBuffer | null,
    lang: string,
    state: number,
    readerCounters?: ReaderCounter[],
    materialChecks?: Record<string, boolean>
}

export interface ReaderCounter {
    id: number,
    slotIndex: number,
    value: number
}
