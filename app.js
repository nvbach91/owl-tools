// This script takes each language label from a text file

// iri	type	property	isDefinedBy	en	no	fi	sv	da
// http://example.net/MyClass	owl:Class	rdfs:label	http://example.net/FirstOntology	My Class	Klassen Min	Luokkani	Min Klass	Min Klasse
// http://example.net/MyAnotherClass	owl:Class	rdfs:comment	http://example.net/SecondOntology	My Another Class	Min Andre Klassen	Toinen Luokani	Min Andra Klass	Min Anden Klasse

// and add them to the respective ontology oncept (to the end of that concept) in a file that includes that concept

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const argv = require('yargs').argv;
const isDefinedByFileNameMap = {};
const ontologyFolder = argv.ontologyFolder;
if (!fs.existsSync(ontologyFolder)) {
    console.error('Ontology folder not found', ontologyFolder);
    console.error('  Use --ontologyFolder=');
    process.exit();
}
const sourceDataFileName = argv.sourceFile;
if (!fs.existsSync(sourceDataFileName)) {
    console.error('Source data file not found', sourceDataFileName);
    console.error('  Use --sourceFile=');
    process.exit();
}
String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};
Promise.each(fs.readdirSync(path.join(ontologyFolder)), (file) => {
    if (!file.endsWith('.owl') || file.startsWith('x_')) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const lineReader = readline.createInterface({
            input: fs.createReadStream(path.join(ontologyFolder, file))
        });
        
        lineReader.on('line', (line) => {
            if (line.includes('owl:Ontology rdf:about')) {
                isDefinedByFileNameMap[line.replace('<owl:Ontology rdf:about="', '').replace('">', '').trim()] = file;
                lineReader.close();
            }
        });
        lineReader.on('close', resolve);
    });
}).then(() => {
    // console.log(isDefinedByFileNameMap);
    // return false;
    const fileContent = fs.readFileSync(sourceDataFileName, 'utf8');

    let currentTargetFile = '';
    let currentTargetFileContent = '';

    let lines = fileContent.split(/[\r\n]+/);
    const header = lines[0];
    const [ entity, type, property, isDefinedBy, ...langHeaders] = header.split('\t');
    lines = lines.slice(1);
    // console.log(lines).slice(20)
    // lines = lines.sort((a, b) => {
    //     const aIsDefinedBy = a.split('\t')[3];
    //     const bIsDefinedBy = b.split('\t')[3];
    //     if (aIsDefinedBy > bIsDefinedBy) return 1;
    //     if (aIsDefinedBy < bIsDefinedBy) return -1;
    //     return 0;
    // });
    // console.log(lines).slice(20)
    lines.forEach((line) => {
        //console.log(line);
        if (!line.trim()) return false;
        const fields = line.split('\t');
        const [entity, type, property, isDefinedBy, ...languages] = fields;
        // console.log(property);
        const file = isDefinedByFileNameMap[isDefinedBy];
        if (!file) {
            console.log(isDefinedBy);
        }
        const labels = {};
        languages.forEach((l, i) => {
            labels[langHeaders[i]] = l;
        });
        const filePath = path.join(ontologyFolder, `/${file}`);
        // console.log({entity, type, property, isDefinedBy, file, en, sv, fi, da});
        if (currentTargetFile !== file) {
            // console.log('loading new file', file);
            currentTargetFile = file;
            currentTargetFileContent = fs.readFileSync(filePath, 'utf8');
        }
        // console.log(file, targetFileContent.slice(0, 300));
        
        // const xmlNsProductCore = 'xmlns:product-core="http://ontology.bisnode.net/product/core/"';
        // const xmlNsCore = 'xmlns:core="http://ontology.bisnode.net/core/"';
        // if (property === 'product-core:productLabel' && currentTargetFileContent.indexOf(xmlNsProductCore) === -1) {
        //     currentTargetFileContent = currentTargetFileContent.replace(xmlNsCore, `${xmlNsCore}\n     ${xmlNsProductCore}`);
        // }
        const entityMarker = `<!-- ${entity} -->`;
        const entityMarkerPosition = currentTargetFileContent.indexOf(entityMarker);
        const entityHeaderPortionStartIndex = entityMarkerPosition + entityMarker.length;
        const entityHeaderPortionEndIndex = entityHeaderPortionStartIndex + 10000;
        const entityHeaderPortion = currentTargetFileContent.slice(
            entityHeaderPortionStartIndex, 
            entityHeaderPortionEndIndex // an approximated amount of characters that should contains the end of an entity's tag
        );
        
        // console.log('*', entityMarker);
        // console.log('+', entityHeaderPortion);
        // console.log('');
        // console.log('');
        // console.log(type, `</${type}>`, entityHeaderPortion.indexOf(`</${type}>`));
        let indexOfEndEntityTag = entityHeaderPortion.indexOf(`</${type}>`);
        if (indexOfEndEntityTag === -1) {
            console.error('indexOfEndEntityTag not found', entityMarkerPosition, entityMarker, file, type, entityHeaderPortion.slice(0, 100));
            console.error('');
        } else {
            if ((entityHeaderPortion.slice(0, indexOfEndEntityTag + `</${type}>`.length).match(new RegExp(type, 'g')) || []).length > 2) {
                indexOfEndEntityTag = indexOfEndEntityTag + entityHeaderPortion.slice(indexOfEndEntityTag + `</${type}>`.length).indexOf(`</${type}>`) + `</${type}>`.length;
            }
            let entityPortion = entityHeaderPortion.slice(0, indexOfEndEntityTag);
            // const positionToInsert = entityMarkerPosition + entityMarker.length + indexOfEndEntityTag - 5;
            // const stringToInsert = 
            Object.keys(labels).filter((lang) => {
                return !!labels[lang].trim().replace(/ +/g, '');
            }).sort().forEach((lang) => {
                if (entityPortion.includes(`<${property} xml:lang="${lang}">`)) {
                    entityPortion = entityPortion.replace(new RegExp(` +<${property} xml:lang="${lang}">.+<\\/${property}>[\\r\\n]+`), '');
                }
            // }).map((lang) => {
                // console.log(labels[lang]);
                // console.log(labels[lang].trim().replace(/ +/g, ' ').replace(/'/g, '&apos;'));
                entityPortion += `    <${property} xml:lang="${lang}">${labels[lang].trim().replace(/ +/g, ' ').replace(/'/g, '&apos;').replace(/\\?"/g, '&quot;')}</${property}>\r\n    `;
            });
            currentTargetFileContent = currentTargetFileContent.slice(0, entityHeaderPortionStartIndex) + 
                entityPortion + entityHeaderPortion.slice(indexOfEndEntityTag) + 
                currentTargetFileContent.slice(entityHeaderPortionEndIndex);

            fs.writeFileSync(filePath, currentTargetFileContent);
        }
    });
});
