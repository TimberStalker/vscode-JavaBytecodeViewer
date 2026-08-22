// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BytecodeProvider } from "./bytecodeProvider"

const getUriFromSource = (source: any): vscode.Uri | undefined => {
	if(source instanceof vscode.Uri){
		return source;
	} else if(source.nodeData){
		return vscode.Uri.parse(source.uri);
	}

	return undefined;
};
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Java Bytecode Viewer is now active!');

	const bytecodeviewer = vscode.workspace.registerTextDocumentContentProvider("bytecode", new BytecodeProvider)
	context.subscriptions.push(bytecodeviewer);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const viewbytecode = vscode.commands.registerCommand('javabytecodeviewer.viewbytecode', async (source?) => {
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
		
		const uri = vscode.Uri.parse(`bytecode:${encodeURIComponent(classPath)}?class=${encodeURIComponent(library)}`);
		const doc = await vscode.workspace.openTextDocument(uri);
		await vscode.languages.setTextDocumentLanguage(doc, "plaintext")
		await vscode.window.showTextDocument(doc);
	});


	context.subscriptions.push(viewbytecode);
}

// This method is called when your extension is deactivated
export function deactivate() {}
