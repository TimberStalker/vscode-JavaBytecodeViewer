import * as vscode from 'vscode';
import { exec } from "child_process";
import fs from 'fs';

export class BytecodeProvider implements vscode.TextDocumentContentProvider{
    onDidChange?: vscode.Event<vscode.Uri> | undefined;
    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        const classPath = decodeURIComponent(uri.path).trim();
        const libraryPath = decodeURIComponent(uri.query.split("class=")[1]).trim();

        const classRegex: RegExp = /^([a-zA-Z])+(\.([a-zA-Z])+)*$/;
        
        if(!classRegex.test(classPath)){
            throw new Error(`'${classPath}' is not a valid class path.`);
        }
        if(!fs.existsSync(libraryPath)){
            throw new Error(`'${libraryPath}' is not a valid file path.`);
        }
        
        return new Promise((resolve, reject) => {
            var process = exec(`javap -cp "${libraryPath}" -c -private "${classPath}"`, (error, stdout, stderr) => {
                if(error) reject({error, stderr});
                resolve(stdout);
            });
            token.onCancellationRequested(() => {
                if(!process.killed){
                    reject("Cancelled");
                    process.kill();
                }
            });
        });
    }

}