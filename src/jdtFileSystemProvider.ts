import { Disposable, Event, EventEmitter, FileChangeEvent, FileStat, FileSystemProvider, FileType, Uri } from "vscode";
import AdmZip from "adm-zip";
import { debug } from "console";

export class JdtFileSystemProvider implements FileSystemProvider{
    onDidChangeFile: Event<FileChangeEvent[]> = new EventEmitter<FileChangeEvent[]>().event;

    watch(uri: Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[]; }): Disposable {
        return new Disposable(() => {});
    }
    stat(uri: Uri): FileStat | Thenable<FileStat> {
        return {
           type: FileType.File, ctime: 0, mtime: 0, size: 0
        }
    }
    readDirectory(uri: Uri): [string, FileType][] | Thenable<[string, FileType][]> {
        return [];
    }
    createDirectory(uri: Uri): void | Thenable<void> {
    }
    readFile(uri: Uri): Uint8Array | Thenable<Uint8Array> {
        const [, path,,,] = uri.query.split('=');

		const library = path.substring(path.indexOf('/')+1).replaceAll('\\/', '/');
        const zip = new AdmZip(library);
        const file = zip.readFile(uri.path.substring(1));
        
        return file || new Uint8Array(0);

    }
    writeFile(uri: Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean; }): void | Thenable<void> {
    }
    delete(uri: Uri, options: { readonly recursive: boolean; }): void | Thenable<void> {
    }
    rename(oldUri: Uri, newUri: Uri, options: { readonly overwrite: boolean; }): void | Thenable<void> {
    }
    copy?(source: Uri, destination: Uri, options: { readonly overwrite: boolean; }): void | Thenable<void> {
    }

}