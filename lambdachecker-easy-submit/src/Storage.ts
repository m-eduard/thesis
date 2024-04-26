import * as vscode from 'vscode';

/**
 * A storage utility. It can handle a subset of pairs stored
 * in vscode context global state.
 */
export class Storage {
    private readonly context: vscode.ExtensionContext;
    private keys: Set<string>;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.keys = new Set<string>();
    }

    /**
     * Store a key-value pair in a persistent storage
     * provided by VsCode's context.globalState object.
     * 
     * *Note* that using `undefined` as value removes the key
     * from the underlying storage.
     * 
     * @param key A string
     * @param value A string or undefined
     */
    async put(key: string, value: string | undefined) {
        if (value === undefined) {
            this.keys.delete(key);
        } else {
            this.keys.add(key);
        }

        return this.context.globalState.update(key, value);
    }

    /**
     * Return the value associated with the received key.
     * 
     * @param key A string
     * @returns The stored value or undefined
     */
    get(key: string): string | undefined {
        if (this.keys.has(key)) {
            return this.context.globalState.get(key);
        }

        return undefined;
    }

    /**
     * Remove all stored key-value pairs from global state.
     */
    async clear() {
        for (const key of this.keys) {
            this.context.globalState.update(key, undefined);
        }

        this.keys.clear();
    }
}
