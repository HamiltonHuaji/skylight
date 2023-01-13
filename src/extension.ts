// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LightSensor } from '@nodert-win10-19h1/windows.devices.sensors';
import { CronJob } from 'cron';

class IlluminanceWatcher {
    interval: number = 1000;
    sensor: any = LightSensor.getDefault();
    job: CronJob;
    statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        context.subscriptions.push(this.statusBarItem);

        this.job = new CronJob('* * * * *', () => {
            this.checkIlluminance();
        }, null, false);

        this.checkIlluminance();
        this.statusBarItem.show();
    }
    destructor() {
        this.disable();
    }

    enable() {
        if (!this.job.running) {
            this.job.start();
            vscode.window.showInformationMessage(`Activated skylight`);
        }
    }

    disable() {
        if (this.job.running) {
            this.job.stop();
            vscode.window.showInformationMessage(`Deactivated skylight`);
        }
    }

    toggle() {
        if (this.job.running) {
            this.disable();
        } else {
            this.enable();
        }
    }

    checkIlluminance() {
        let reading = this.sensor.getCurrentReading().illuminanceInLux;
        this.statusBarItem.text = `${reading}`;
        this.statusBarItem.show();
        vscode.window.showInformationMessage(`Skylight: ${reading}`);
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
    watcher.enable();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const activateCommandId = 'skylight.activate';
    const deactivateCommandId = 'skylight.deactivate';
    const toggleCommandId = 'skylight.toggle';

    let activateCommand = vscode.commands.registerCommand(activateCommandId, () => watcher?.enable());
    let deactivateCommand = vscode.commands.registerCommand(deactivateCommandId, () => watcher?.disable());
    let toggleCommand = vscode.commands.registerCommand(toggleCommandId, () => watcher?.toggle());

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
