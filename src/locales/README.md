Note
====


this symlink is only needed so that `src/i18n.ts` can correctly load its contents
and make typescript happy. We can't import from public since it is outside of src,
and we need to keep the translations there, so they can be served from there.