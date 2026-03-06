# wake-cli

CLI to start Wake storefront projects from the project root.

`wake-cli` automates two common tasks in Wake projects:

- Start `fbits.storefront` using the token from `Configs/settings.json`
- Start `tailwindcss --watch` for every `input*.css` file inside `Assets/CSS/`

## Requirements

- Node.js installed
- `fbits.storefront` installed on your machine and available in your PATH
- Tailwind CSS installed either globally in your PATH or locally in the Wake project through npm
- A Wake project containing:
  - `Configs/settings.json`
  - `Assets/CSS/`

## External tools

Before using `wake-cli`, install the required CLIs on your machine.

### `fbits.storefront`

`fbits.storefront` is required to start the local Wake Storefront server.

Follow the official Wake Commerce installation guide for your operating system:

- https://wakecommerce.readme.io/docs/local#download

After installation, make sure `fbits.storefront` is available from your terminal.

### Tailwind CSS

`wake-cli` supports two Tailwind installation modes:

1. Global CLI available in your PATH:

```bash
npm install -g tailwindcss
```

2. Local npm installation inside the Wake project:

```bash
npm install -D tailwindcss
```

When running `wake tailwind` or `wake`, the CLI will:

- use the local npm Tailwind installation when `node_modules/.bin/tailwindcss` exists in the current project
- otherwise fall back to the global `tailwindcss` command from your PATH

## Expected project structure

Run the commands from the root of your Wake project:

```text
your-wake-project/
├── Configs/
│   └── settings.json
└── Assets/
    └── CSS/
        ├── input.css
        ├── input_login.css
        └── input_checkout.css
```

`settings.json` must contain an `access_token` field:

```json
{
  "access_token": "your-token-here"
}
```

## Installation

Install globally from npm:

```bash
npm install -g wake-cli
```

For local development of this package, inside the package folder:

```bash
npm install -g .
```

## Usage

Go to your Wake project root and run one of the commands below.

If you are using a local npm Tailwind installation, run these commands from the same project root where `tailwindcss` was installed.

### Start everything

Starts `fbits.storefront` and all Tailwind watchers:

```bash
wake
```

### Start only storefront

```bash
wake storefront
```

Or:

```bash
wake-storefront
```

### Start only Tailwind watchers

Starts one watcher for each `input*.css` file found directly inside `Assets/CSS/`.

```bash
wake tailwind
```

Or:

```bash
wake-tailwind
```

## CSS file mapping

Each input file is mapped to an output file by replacing the leading `input` prefix with `output`.

Examples:

- `input.css` -> `output.css`
- `input_login.css` -> `output_login.css`
- `input_partner.css` -> `output_partner.css`

## How it works

### `wake storefront`

- Reads `Configs/settings.json`
- Extracts `access_token`
- Runs:

```bash
fbits.storefront --token <access_token>
```

### `wake tailwind`

- Reads files directly from `Assets/CSS/`
- Finds files that start with `input` and end with `.css`
- Starts one process per file
- Uses local npm Tailwind when available, otherwise uses the global `tailwindcss` command:

```bash
tailwindcss -i ./Assets/CSS/input.css -o ./Assets/CSS/output.css --watch
```

## Errors

The CLI exits with code `1` when:

- `Configs/settings.json` does not exist
- `Configs/settings.json` is invalid JSON
- `access_token` is missing or empty
- `Assets/CSS/` does not exist
- No `input*.css` files are found

## Notes

- Only files directly inside `Assets/CSS/` are scanned
- Subdirectories are not scanned
- The CLI uses only Node.js built-in modules
- Tailwind can be installed globally or locally via npm in the Wake project
- On Windows, separate commands are exposed as `wake-storefront` and `wake-tailwind` instead of names containing `:`

## License

MIT
