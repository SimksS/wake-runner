#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const cwd = process.cwd();

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}

function parseJsonFile(filePath, fileLabel) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  } catch (error) {
    exitWithError(`Erro: ${fileLabel} inválido.`);
  }
}

function getToken() {
  const settingsPath = path.join(cwd, 'Configs', 'settings.json');

  if (!fs.existsSync(settingsPath)) {
    exitWithError('Erro: Configs/settings.json não encontrado. Execute dentro de um projeto Wake.');
  }

  const settings = parseJsonFile(settingsPath, 'Configs/settings.json');
  const token = settings.access_token;

  if (!token) {
    exitWithError('Erro: access_token não encontrado no settings.json.');
  }

  return token;
}

function getInputFiles() {
  const cssDir = path.join(cwd, 'Assets', 'CSS');

  if (!fs.existsSync(cssDir)) {
    exitWithError('Erro: pasta Assets/CSS não encontrada.');
  }

  const inputFiles = fs.readdirSync(cssDir, { withFileTypes: true })
    .filter(
      entry => entry.isFile() && entry.name.startsWith('input') && entry.name.endsWith('.css')
    )
    .map(entry => entry.name);

  if (inputFiles.length === 0) {
    exitWithError('Erro: nenhum arquivo input*.css encontrado em Assets/CSS.');
  }

  return inputFiles;
}

function spawnCommand(command, args) {
  spawn(command, args, {
    stdio: 'inherit',
    cwd,
    shell: true,
  });
}

function hasLocalTailwindBinary() {
  const localBinNames = process.platform === 'win32'
    ? ['tailwindcss.cmd', 'tailwindcss']
    : ['tailwindcss'];

  return localBinNames.some(binName =>
    fs.existsSync(path.join(cwd, 'node_modules', '.bin', binName))
  );
}

function getTailwindCommand() {
  if (hasLocalTailwindBinary()) {
    return {
      command: 'npm',
      argsPrefix: ['exec', 'tailwindcss', '--'],
      sourceLabel: 'npm local',
    };
  }

  return {
    command: 'tailwindcss',
    argsPrefix: [],
    sourceLabel: 'PATH global',
  };
}

function runStorefront() {
  const token = getToken();

  console.log(`Token carregado: ${token.slice(0, 10)}...`);
  console.log('Iniciando fbits.storefront...');

  spawnCommand('fbits.storefront', ['--token', token]);
}

function runTailwind() {
  const inputFiles = getInputFiles();
  const tailwind = getTailwindCommand();

  console.log(`Arquivos CSS encontrados: ${inputFiles.join(', ')}\n`);
  console.log(`Usando Tailwind via ${tailwind.sourceLabel}.`);

  for (const inputFile of inputFiles) {
    const outputFile = inputFile.replace(/^input/, 'output');
    const inputPath = `./Assets/CSS/${inputFile}`;
    const outputPath = `./Assets/CSS/${outputFile}`;

    console.log(`Iniciando Tailwind: ${inputFile} -> ${outputFile}`);
    spawnCommand(tailwind.command, [
      ...tailwind.argsPrefix,
      '-i',
      inputPath,
      '-o',
      outputPath,
      '--watch',
    ]);
  }
}

function printUsage() {
  console.log('Uso:');
  console.log('  wake');
  console.log('  wake storefront');
  console.log('  wake tailwind');
  console.log('  wake-storefront');
  console.log('  wake-tailwind');
}

function runCli(mode) {
  switch (mode) {
    case 'all':
      runStorefront();
      runTailwind();
      break;
    case 'storefront':
      runStorefront();
      break;
    case 'tailwind':
      runTailwind();
      break;
    default:
      printUsage();
      process.exit(1);
  }
}

function isCliEntrypoint() {
  const mainFilename = require.main && require.main.filename;

  if (!mainFilename) {
    return false;
  }

  const allowedEntrypoints = [
    __filename,
    path.join(__dirname, 'wake-storefront.js'),
    path.join(__dirname, 'wake-tailwind.js'),
  ];

  return allowedEntrypoints.some(entrypoint =>
    path.resolve(mainFilename) === path.resolve(entrypoint)
  );
}

if (isCliEntrypoint()) {
  const mode = process.env.WAKE_MODE || process.argv[2] || 'all';
  runCli(mode);
}

module.exports = {
  runCli,
};
