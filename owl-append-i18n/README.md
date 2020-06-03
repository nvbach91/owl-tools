# OWL Annotation I18N Appender
Import translations of `rdfs:label` and `rdfs:comment` of ontology entities from a CSV table to your ontologie files

## Usage
- Given a CSV file in the following structure:
    ```csv
    iri	type	property	isDefinedBy	en	no	fi	sv	da
    http://example.net/MyClass	owl:Class	rdfs:label	http://example.net/FirstOntology	My Class	Klassen Min	Luokkani	Min Klass	Min Klasse
    http://example.net/MyAnotherClass	owl:Class	rdfs:comment	http://example.net/SecondOntology	My Another Class	Min Andre Klassen	Toinen Luokani	Min Andra Klass	Min Anden Klasse
    ```

- and a folder of OWL ontologies (`.owl`, `application/rdf+xml`) like this
    ```
    ontologies
    \- first-ontology.owl
    |- second-ontology.owl
    |- ...
    ```

- you can import these translations of each concept by running
    ```bash
    node app.js --ontologyFolder=C:/ontologies --sourceFile=translations.csv
    ```

## Options
- You can have as many language columns as you want, as long as the headers are unique

## Requirements
- Each concept must be annotated with `rdfs:isDefinedBy` and must have the IRI of the ontology that it lives in as its value.
- Values in the `type` and `property` columns in the CSV must be prefixed, e.g. `owl:Class`, `owl:NamedIndividual`, `rdfs:label`, `rdfs:comment`

## Limitations
- this tool can't handle multi-line values and assumes your `rdfs:comment` and `rdfs:label` values are one-lined

## Installation
- You will need `node.js` and `npm` to install and run this program
    ```bash
    git clone https://github.com/nvbach91/owl-tools.git
    cd owl-tools/owl-import-i18n && npm install
    ```
