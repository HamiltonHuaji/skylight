// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CronJob } from 'cron';
import { LightSensor } from '@nodert-win10-19h1/windows.devices.sensors';

class IlluminanceWatcher {
    sensor: any = LightSensor.getDefault();
    job: CronJob;
    statusBarItem: vscode.StatusBarItem;

    oldTheme: string | null = null;
    smoothExponent: () => number;
    lightTheme: () => string;
    darkTheme: () => string;
    upperThreshold: () => number;
    lowerThreshold: () => number;
    setTheme: (newTheme: string) => void;
    autoDetectColorScheme: () => boolean;

    constructor(context: vscode.ExtensionContext) {
        let configuration = vscode.workspace.getConfiguration();

        let cronExpr = configuration.get("skylight.cron", "* * * * * *");

        this.lightTheme = () => configuration.get("workbench.preferredLightColorTheme", "");
        this.darkTheme = () => configuration.get("workbench.preferredDarkColorTheme", "");
        this.upperThreshold = () => configuration.get("skylight.upperThreshold", 1000);
        this.lowerThreshold = () => configuration.get("skylight.lowerThreshold", 200);
        this.smoothExponent = () => configuration.get("skylight.smoothExponent", 0.5);
        this.autoDetectColorScheme = () => configuration.get("window.autoDetectColorScheme", false) || configuration.get("window.autoDetectHighContrast", false);
        this.setTheme = (newTheme: string) => { if (newTheme !== this.oldTheme) { configuration.update("workbench.colorTheme", newTheme, true); this.oldTheme = newTheme; } };

        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        context.subscriptions.push(this.statusBarItem);

        this.job = new CronJob(cronExpr, () => {
            this.checkIlluminance();
        }, null, false);

        this.checkIlluminance();
    }

    destructor() {
        this.disable();
    }

    enable() {
        if (!this.job.running) {
            if (this.autoDetectColorScheme()) {
                vscode.window.showInformationMessage(`Please set window.autoDetectColorScheme and window.autoDetectHighContrast to false to activate SkyLight.`);
                return;
            }
            this.job.start();
            vscode.window.showInformationMessage(`Skylight activated`);
        }
    }

    disable() {
        if (this.job.running) {
            this.job.stop();
            this.statusBarItem.text = `$(lightbulb): -`;
            this.statusBarItem.show();
            vscode.window.showInformationMessage(`Skylight deactivated`);
        }
    }

    toggle() {
        if (this.job.running) {
            this.disable();
        } else {
            this.enable();
        }
    }

    smooth: number | null = null;

    checkIlluminance() {
        let reading: number = this.sensor.getCurrentReading().illuminanceInLux;
        if (this.smooth === null) {
            this.smooth = reading;
        }
        let a = this.smoothExponent();
        this.smooth = a * this.smooth + (1 - a) * reading;

        let upper = this.upperThreshold();
        let lower = this.lowerThreshold();
        let light = this.lightTheme();
        let dark = this.darkTheme();
        if (upper <= lower || light === dark) {
            this.statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
            this.statusBarItem.text = `$(lightbulb): Configuration needed.`;
        } else {
            this.statusBarItem.text = `$(lightbulb): ${this.smooth.toFixed(2)} Lux`;
        }
        this.statusBarItem.show();

        if (this.smooth > upper && light !== "") {
            // use light theme
            this.setTheme(light);
        } else if (this.smooth < lower && dark !== "") {
            // use dark theme
            this.setTheme(dark);
        }
    }
}

let watcher: IlluminanceWatcher | null = null;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    watcher = new IlluminanceWatcher(context);
    watcher.enable();

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
