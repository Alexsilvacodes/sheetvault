# Achievements Gallery

This feature displays a gallery of campaign achievements for the ongoing Blades in the Dark campaign. It lives at `/achievements` and is publicly accessible (no login required).

## How it works

Each achievement is a JPG image following this naming convention:

```
Achievement Name - Author or Band.jpg
```

Examples:
- `Esta es nuestra ciudad - Skovland Yard.jpg`
- `No habrá paz para los malvados - Los Baifos.jpg`

The app parses the filename automatically to extract the achievement title and the person or group credited.

## Adding new achievements

1. Name your image following the convention above: `Title - Author.jpg`
2. Drop the file into `packages/client/static/achievements/`
3. Update the manifest so the gallery picks it up:

```bash
ls packages/client/static/achievements/*.jpg | \
  xargs -I{} basename {} | \
  python3 -c "import sys,json; print(json.dumps(sorted(sys.stdin.read().splitlines()), ensure_ascii=False, indent=2))" \
  > packages/client/static/achievements.json
```

4. Commit both the image and the updated `achievements.json`.

## File structure

```
packages/client/static/
├── achievements/
│   ├── README.md          ← this file
│   ├── Achievement 1 - Author.jpg
│   └── ...
└── achievements.json      ← manifest listing all images in order
```

## Theme

The gallery uses the app's CSS theme variables, so it adapts automatically to both the default and the Blades in the Dark theme (dark background with amber/gold accents).
