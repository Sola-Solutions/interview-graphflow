#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";

import { schemas } from "./schemas";

const outputDir = resolve(__dirname, "codegen");
mkdirSync(outputDir, { recursive: true });

// Generate a single combined schema file for all schemas
const combinedSchema: any = {
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {},
};

// Process each schema
Object.entries(schemas).forEach(([name, zodSchema]) => {
  const jsonSchema = zodToJsonSchema(zodSchema, {
    name,
    target: "jsonSchema7",
  }) as any; // Type assertion to handle the complex schema structure

  // Extract the definition
  if (jsonSchema.definitions && jsonSchema.definitions[name]) {
    combinedSchema.definitions[name] = jsonSchema.definitions[name];
  } else if (jsonSchema.$ref) {
    // Handle referenced schema
    const refName = jsonSchema.$ref.split("/").pop();
    if (jsonSchema.definitions && jsonSchema.definitions[refName]) {
      combinedSchema.definitions[name] = jsonSchema.definitions[refName];
    }
  } else {
    // Direct schema without references
    combinedSchema.definitions[name] = { ...jsonSchema };
    delete combinedSchema.definitions[name].$schema;
  }
});

// Write the combined schema
const outputPath = resolve(outputDir, "api-schemas.json");
writeFileSync(outputPath, JSON.stringify(combinedSchema, null, 2));

console.log(`All schemas written to ${outputPath}`);
console.log(`Generated schemas: ${Object.keys(schemas).join(", ")}`);
