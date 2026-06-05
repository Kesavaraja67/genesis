import { readFileSync } from "fs";
import { parseConfig } from "./lib/config/parser";

const json = readFileSync("./test-config.json", "utf-8");
const config = JSON.parse(json);

const result = parseConfig(config);
console.log(JSON.stringify(result, null, 2));
