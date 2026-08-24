// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BytecodeProvider } from "./bytecodeProvider"
import { Constants } from './constants';
import { Commands } from './commands';

const getUriFromSource = (source: any): vscode.Uri | undefined => {
	if(source instanceof vscode.Uri){
		return source;
	} else if(source.nodeData){
		return vscode.Uri.parse(source.uri);
	}

	return undefined;
};
export const createJdtBytecodeUri = (libraryPath: string, classPath: string): vscode.Uri => {
	return vscode.Uri.parse(`${Constants.JdtBytecodeSchema}:${encodeURIComponent(classPath)}?class=${encodeURIComponent(libraryPath)}`)
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Java Bytecode Viewer is now active!');

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(Constants.JdtBytecodeSchema, new BytecodeProvider));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.VIEW_BYTECODE, async (source?) => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let library: string | undefined;
		let classPath: string | undefined;
		if(!source){
			library = await vscode.window.showInputBox({ prompt: "Enter Library Path"})
			if(!library) return;
			classPath = await vscode.window.showInputBox({ prompt: "Enter Class Path"})
			if(!classPath) return;
		} else {
			const uri = getUriFromSource(source);
			if(!uri) return;
			const [, path,,, item] = uri.query.split('=');
			
			library = path.substring(path.indexOf('/')+1).replaceAll('\\/', '/');
			classPath = item.replace("/", "").replace("<", "").replace("(", ".").replace(".class", "");
		}
		
		if(!library) return;
		if(!classPath) return;
		
		const uri = createJdtBytecodeUri(library,classPath);
		const doc = await vscode.workspace.openTextDocument(uri);
		await vscode.languages.setTextDocumentLanguage(doc, "plaintext")
		await vscode.window.showTextDocument(doc);
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
