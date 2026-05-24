declare module "pdfjs-dist/legacy/build/pdf" {
  const pdfjsLib: any;
  export = pdfjsLib;
}

declare module "pdfjs-dist/legacy/build/pdf.worker.js?url" {
  const workerUrl: string;
  export default workerUrl;
}
