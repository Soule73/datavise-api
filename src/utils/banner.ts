import { Express } from 'express';
import chalk from 'chalk';

const banner = `
███╗   ██╗ ██████╗ ██████╗ ███████╗    ██╗   ██╗███████╗██████╗  ██████╗███████╗██╗     
████╗  ██║██╔═══██╗██╔══██╗██╔════╝    ██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝██║     
██╔██╗ ██║██║   ██║██║  ██║█████╗      ██║   ██║█████╗  ██████╔╝██║     █████╗  ██║     
██║╚██╗██║██║   ██║██║  ██║██╔══╝      ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║     ██╔══╝  ██║     
██║ ╚████║╚██████╔╝██████╔╝███████╗     ╚████╔╝ ███████╗██║  ██║╚██████╗███████╗███████╗
╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝      ╚═══╝  ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚══════╝
`;

function printBanner(text: string): void {
    const lines = text.split('\n');
    const colors = [
        chalk.yellow,
        chalk.green,
        chalk.cyan,
    ];

    lines.forEach((line, index) => {
        if (line.trim()) {
            console.log(colors[index % colors.length](line));
        } else {
            console.log(line);
        }
    });
}

export function startServer(app: Express, port: number): void {
    app.listen(port, () => {
        console.clear();
        console.log('\n');
        printBanner(banner);
        console.log('\n');
        const serverUrl = `http://localhost:${port}`;
        console.log(chalk.bold('🚀 Server Status'));
        console.log(chalk.dim('──────────────'));
        console.log(`${chalk.green('✓')} ${chalk.bold('Status')}: ${chalk.green('Running')}`);
        console.log(`${chalk.blue('🌐')} ${chalk.bold('URL')}: ${chalk.cyan(serverUrl)}`);
        console.log(`${chalk.magenta('🔧')} ${chalk.bold('Environment')}: ${chalk.cyan(process.env.NODE_ENV || 'development')}`);
        console.log(`${chalk.blue('⏱️')} ${chalk.bold('Started at')}: ${chalk.cyan(new Date().toLocaleString())}`);
        console.log(chalk.dim('──────────────\n'));
    });
} 