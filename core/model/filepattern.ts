export interface FilePattern {
    name: string,
    content: string | ArrayBuffer | null,
    lang: string,
    state: number
}
