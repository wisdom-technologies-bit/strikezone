# src/contract

`contract.ts` is a verbatim copy of `src/api/contract.ts` from
[strikezone-server](https://github.com/wisdom-technologies-bit/strikezone-server),
with the source commit hash in its header comment. It imports nothing but `zod`,
so it compiles here on its own.

## Do not edit it

Not to fix a type, not to add a helper, not to change a name. If the server moves,
copy the file again and update the commit hash in the header. Everything the site
knows about stream frames, market shapes and API responses comes from here, so a
protocol change should break compilation rather than a game.

There is no `index.ts`. Import from `src/contract/contract` so the verbatim file
keeps its single, checkable identity.

## Exports the site uses

- Primitives: `moneySchema`, `timestampSchema`, `moneyModeSchema`,
  `matchStatusSchema`, `botLevelSchema`, `CONTRACT_VERSION`.
- Frames: `encodedFramesSchema`, `decodeFrames`, `frameBodies`, `positionAt`,
  `BOARD_SPAN_MM`, `FRAME_SCALE`, `FRAME_ABSENT`.
- Stream: `STREAM_MESSAGES`, `spectatorMessageSchema`, `ludoRollMessageSchema`,
  `ludoMoveMessageSchema`, `ludoSnapshotMessageSchema`.
- Responses: `configSchema`, `matchesResponseSchema`, `matchResponseSchema`,
  `marketsResponseSchema`, `walletResponseSchema`, `betsResponseSchema`, plus the
  query schemas.

## How to test

Compare the copy against the server file:

```sh
git --git-dir=/path/to/strikezone-server/.git show <hash>:src/api/contract.ts \
  | diff - <(tail -n +8 src/contract/contract.ts)
```

A type check of this directory must pass with `zod` installed and nothing else.
