// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LightSensor } from '@nodert-win10-19h1/windows.devices.sensors';


function checkIlluminance(sensor: LightSensor) {
    let reading = sensor.getCurrentReading().illuminanceInLux;
    vscode.window.showInformationMessage(sensor.getCurrentReading().illuminanceInLux.toString());
    if (reading > 100) {
        // use light theme
    } else {
        // use dark theme
    }
}

let interval: number = 1000;
let sensor = LightSensor.getDefault();
let handler: NodeJS.Timer | null = null;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "skylight" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const activateCommandId = 'skylight.activate';
    const deactivateCommandId = 'skylight.deactivate';
    const toggleCommandId = 'skylight.toggle';

    let activateCommand = vscode.commands.registerCommand(activateCommandId, () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        handler = setInterval(() => {
            checkIlluminance(sensor);
        }, interval);
    });
    let deactivateCommand = vscode.commands.registerCommand(deactivateCommandId, () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        if (handler !== null) {
            clearInterval(handler);
            handler = null;
        }
    });
    let toggleCommand = vscode.commands.registerCommand(toggleCommandId, () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        if (handler !== null) {
            clearInterval(handler);
            handler = null;
        } else {
            handler = setInterval(() => {
                checkIlluminance(sensor);
            }, interval);
        }
    });

    context.subscriptions.push(activateCommand);
    context.subscriptions.push(deactivateCommand);
    context.subscriptions.push(toggleCommand);

    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = toggleCommandId;
    context.subscriptions.push(statusBarItem);
}

// This method is called when your extension is deactivated
export function deactivate() {
    if (handler !== null) {
        clearInterval(handler);
        handler = null;
    }
}
