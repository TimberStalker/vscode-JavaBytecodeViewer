// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { json } from 'stream/consumers';
import * as vscode from 'vscode';
import { BytecodeProvider } from "./bytecodeProvider"

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
		} else if(source.scheme && source.scheme === "jdt"){
			const javaExtension = vscode.extensions.getExtension("redhat.java");
			if(javaExtension)
			{
				const api = await javaExtension.activate();
				const documentSymbols = await api.getDocumentSymbols();
				const projectSettings = await api.getProjectSettings();
				const classpaths = await api.getClasspaths();
				console.log(classpaths);
			}
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri;
			const uri = vscode.Uri.parse(source);
			const jarIndex = uri.path.indexOf(".jar");
			const libraryUri = vscode.Uri.parse(uri.path.substring(0, jarIndex + 4));
			library = libraryUri.fsPath;
			classPath = uri.path.substring(jarIndex + 5).replace(".java", "").replace("/", ".");
		}
		
		if(!library) return;
		if(!classPath) return;
		
		const uri = vscode.Uri.parse(`bytecode:${encodeURIComponent(classPath)}?class=${encodeURIComponent(library)}`);
		const doc = await vscode.workspace.openTextDocument(uri);
		await vscode.languages.setTextDocumentLanguage(doc, "log")
		await vscode.window.showTextDocument(doc);
	});


	context.subscriptions.push(viewbytecode);
}

// This method is called when your extension is deactivated
export function deactivate() {}
