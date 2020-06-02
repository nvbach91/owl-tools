# OWL Annotation Appender
Import translations from a CSV table to your ontologies

## Usage
Given a CSV file like this
```csv
iri	type	property	isDefinedBy	en	no	fi	sv	da
http://example.net/MyClass	owl:Class	rdfs:label	http://example.net/FirstOntology	My Class	Klassen Min	Luokkani	Min Klass	Min Klasse
http://example.net/MyAnotherClass	owl:Class	rdfs:comment	http://example.net/SecondOntology	My Another Class	Min Andre Klassen	Toinen Luokani	Min Andra Klass	Min Anden Klasse
```

and a folder of OWL ontologies (.owl, application/rdf+xml) like this
```
ontologies
\- first-ontology.owl
|- second-ontology.owl
|- ...
```

You can import these translations of each concept by running
```bash
node app.js --ontologyFolder=C:/ontologies --sourceFile=translations.csv
```

## Options
- You can have as many language columns as you want, as long as the headers are unique

## Requirements
- Each concept must be annotated with rdfs:isDefinedBy and must have the ontology IRI as its value.
- values in the type and property columns in the CSV must be prefixed

## Installation
You will need `node.js` and `npm` to install and run this program
- git clone 
- cd owl-import-i18n && npm install