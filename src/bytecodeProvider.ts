import { TextDocumentContentProvider, Event, Uri, CancellationToken, ProviderResult, extensions } from 'vscode';
import { exec, ExecOptions, ExecOptionsWithStringEncoding } from "child_process";
import fs from 'fs';
import path from 'path';

export class BytecodeProvider implements TextDocumentContentProvider{
    onDidChange?: Event<Uri> | undefined;
    provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string> {
        const classPath = decodeURIComponent(uri.path).trim();
        const libraryPath = decodeURIComponent(uri.query.split("class=")[1]).trim();

        const classRegex: RegExp = /^([a-zA-Z])+(\.([a-zA-Z])+)*$/;
        
        if(!classRegex.test(classPath)){
            throw new Error(`'${classPath}' is not a valid class path.`);
        }
        if(!fs.existsSync(libraryPath)){
            throw new Error(`'${libraryPath}' is not a valid file path.`);
        }
        const api = extensions.getExtension("redhat.java")?.exports;
        return new Promise((resolve, reject) => {
            var process = exec(`javap -cp "${libraryPath}" -c -private "${classPath}"`, {
                cwd: path.join(api.javaRequirement.java_home, "bin")
            } as ExecOptionsWithStringEncoding, (error, stdout, stderr) => {
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