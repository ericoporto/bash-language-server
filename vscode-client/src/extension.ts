'use strict'
import * as path from 'path'
import { ExtensionContext, workspace } from 'vscode'
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient'

export async function activate(context: ExtensionContext) {
  const globPattern = workspace.getConfiguration('AgsScriptIde').get('globPattern', '')

  const highlightParsingErrors = workspace
    .getConfiguration('AgsScriptIde')
    .get('highlightParsingErrors', false)

  const env: any = {
    ...process.env,
    GLOB_PATTERN: globPattern,
    HIGHLIGHT_PARSING_ERRORS: highlightParsingErrors,
  }

  const serverExecutable = {
    module: context.asAbsolutePath(path.join('out', 'server.js')),
    transport: TransportKind.ipc,
    options: {
      env,
    },
  }

  const debugServerExecutable = {
    ...serverExecutable,
    options: {
      ...serverExecutable.options,
      execArgv: ['--nolazy', '--inspect=6009'],
    },
  }

  const serverOptions: ServerOptions = {
    run: serverExecutable,
    debug: debugServerExecutable,
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      {
        scheme: 'file',
        language: 'agsscript',
      },
    ],
    synchronize: {
      configurationSection: 'AGS Script IDE',
      // Notify the server about file changes to '.clientrc files contain in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
    },
  }

  const client = new LanguageClient(
    'AGS Script IDE',
    'AGS Script IDE',
    serverOptions,
    clientOptions,
  )

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(client.start())
}
