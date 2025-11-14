/**
 * Script de vérification de la couverture Swagger
 * Vérifie que tous les endpoints v1 ont une documentation Swagger
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '..', 'src', 'v1', 'routes');

function findRouteFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findRouteFiles(filePath, fileList);
        } else if (file.endsWith('.routes.ts')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function analyzeRouteFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(routesDir, filePath);

    const routeMatches = content.match(/router\.(get|post|put|patch|delete)\(/g) || [];
    const swaggerMatches = content.match(/@(swagger|openapi)/g) || [];

    const endpoints = routeMatches.length;
    const documented = swaggerMatches.length;

    return {
        file: relativePath,
        endpoints,
        documented,
        coverage: endpoints > 0 ? ((documented / endpoints) * 100).toFixed(1) : 'N/A',
        hasIssues: documented < endpoints
    };
}

console.log('\n🔍 Vérification de la couverture Swagger\n');
console.log('='.repeat(80));

const routeFiles = findRouteFiles(routesDir);
const results = routeFiles.map(analyzeRouteFile);

let totalEndpoints = 0;
let totalDocumented = 0;

results.forEach(result => {
    const icon = result.hasIssues ? '⚠️ ' : '✅';
    console.log(`\n${icon} ${result.file}`);
    console.log(`   Endpoints: ${result.endpoints} | Documentés: ${result.documented} | Couverture: ${result.coverage}%`);

    totalEndpoints += result.endpoints;
    totalDocumented += result.documented;
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Total: ${totalDocumented}/${totalEndpoints} endpoints documentés`);
console.log(`📈 Couverture globale: ${((totalDocumented / totalEndpoints) * 100).toFixed(1)}%\n`);

const hasIssues = results.some(r => r.hasIssues);
if (!hasIssues) {
    console.log('✅ Tous les endpoints sont documentés!\n');
    process.exit(0);
} else {
    console.log('⚠️  Certains endpoints nécessitent une documentation\n');
    process.exit(0); // Exit 0 pour ne pas bloquer le build
}
