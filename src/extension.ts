// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LightSensor } from '@nodert-win10-19h1/windows.devices.sensors';

class IlluminanceWatcher {
    interval: number = 1000;
    sensor: any = LightSensor.getDefault();
    handler: NodeJS.Timer | null = null;
    statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        context.subscriptions.push(this.statusBarItem);
        this.checkIlluminance();
        this.statusBarItem.show();
    }
    destructor() {
        this.disable();
    }

    enable() {
        if (this.handler === null) {
            this.handler = setInterval(this.checkIlluminance, this.interval);
            vscode.window.showInformationMessage(`Activated skylight`);
        }
    }

    disable() {
        if (this.handler !== null) {
            clearInterval(this.handler);
            this.sensor.text = `-`;
            this.handler = null;
            vscode.window.showInformationMessage(`Deactivated skylight`);
        }
    }

    checkIlluminance() {
        let reading = this.sensor.getCurrentReading().illuminanceInLux;
        this.statusBarItem.text = `${reading.toString()}`;
        if (reading > 100) {
            // use light theme
        } else {
            // use dark theme
        }
    }
}

let watcher: IlluminanceWatcher | null = null;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "skylight" is now active!');

    watcher = new IlluminanceWatcher(context);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const activateCommandId = 'skylight.activate';
    const deactivateCommandId = 'skylight.deactivate';
    const toggleCommandId = 'skylight.toggle';

    let activateCommand = vscode.commands.registerCommand(activateCommandId, () => watcher?.enable());
    let deactivateCommand = vscode.commands.registerCommand(deactivateCommandId, () => watcher?.disable());
    let toggleCommand = vscode.commands.registerCommand(toggleCommandId, () => {
        if (watcher?.handler !== null) {
            watcher?.disable();
        } else {
            watcher?.enable();
        }
    });

    context.subscriptions.push(activateCommand);
    context.subscriptions.push(deactivateCommand);
    context.subscriptions.push(toggleCommand);

    watcher.statusBarItem.command = toggleCommandId;
}

// This method is called when your extension is deactivated
export function deactivate() {
    watcher?.destructor();
    watcher = null;
}
