/// <reference types="vite/client" />

declare module "*.xlsx" {
  const src: string;
  export default src;
}

declare module "*.xls" {
  const src: string;
  export default src;
}
