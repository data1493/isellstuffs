// Public-text blocklist. Jordan edits this module.
// Long terms are matched with separators and simple digit lookalikes removed.
// Short terms match a whole word only, so "spicy" is not "spic".

export const SLURS = [
  "nigger",
  "nigga",
  "faggot",
  "tranny",
  "wetback",
];

export const WORD_SLURS = [
  "retard",
  "retards",
  "kike",
  "kikes",
  "chink",
  "chinks",
];

export const SHORT_SLURS = [
  "fag",
  "fags",
  "spic",
  "spics",
];

export const URL_HOSTS = ["com", "net", "org", "gg", "io", "xyz", "co", "ru", "ly", "me"];
