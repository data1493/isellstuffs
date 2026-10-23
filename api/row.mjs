import { GET as rowGet, POST as rowPost } from "../the-row/api/row.mjs";

export function GET(request) {
  return rowGet(request);
}

export function POST(request) {
  return rowPost(request);
}
