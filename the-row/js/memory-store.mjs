import { emptyBook } from "./accounts.mjs";
import { fillRoom, crowdBeat } from "./crowd.mjs";
import { seedRoom } from "./room.mjs";

export function createMemoryStore({ crowd = false, onBook, onLive, now = Date.now } = {}) {
  let book = emptyBook();
  let live = {
    state: crowd ? fillRoom() : seedRoom(),
    beat: 0,
    tickAt: now(),
  };
  let chain = Promise.resolve();

  function enqueue(fn) {
    const run = chain.then(fn, fn);
    chain = run.then(() => {}, () => {});
    return run;
  }

  return {
    getLive() {
      return live;
    },
    replaceBook(next) {
      book = {
        users: Array.isArray(next?.users) ? next.users : [],
        sessions: Array.isArray(next?.sessions) ? next.sessions : [],
      };
    },
    tick(at = now()) {
      return enqueue(async () => {
        const stepped = crowdBeat(live.state, live.beat, at);
        live = { state: stepped.state, beat: stepped.beat, tickAt: at };
        if (onLive) await onLive(live.state);
        return live.state;
      });
    },
    transact(fn) {
      return enqueue(async () => {
        let nextBook = null;
        let nextLive = null;
        const result = await fn({
          book,
          live,
          saveBook(value) {
            nextBook = value;
          },
          saveLive(value) {
            nextLive = value;
          },
        });
        if (nextBook) {
          book = nextBook;
          if (onBook) await onBook(book);
        }
        if (nextLive) {
          live = nextLive;
          if (onLive) await onLive(live.state);
        }
        return result;
      });
    },
  };
}
