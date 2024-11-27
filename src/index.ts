import {readFileSync} from "fs";
import {XMLParser, XMLValidator} from "fast-xml-parser";
import {Result, ok, err} from "true-myth/result";
import {Geeklist} from "./schema.js";
import {z} from "zod";
import {parseWantlist, transformWantlist} from "./wantlist/parse.js";

async function fetchGeekList(geeklistId: string): Promise<Result<z.infer<typeof Geeklist>, string>> {
    // const res = await fetch(`https://boardgamegeek.com/xmlapi/geeklist/${geeklistId}`);
    // const xml = await res.text();
    const xml = readFileSync("./geeklist.xml", "utf8");
    const validationResult = XMLValidator.validate(xml);
    if (validationResult === true) {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributesGroupName: "attr",
            attributeNamePrefix: ""
        });
        const root = parser.parse(xml);
        if ('message' in root) {
            return err("Waiting for BGG to fetch data!");
        }
        if (!('geeklist' in root)) {
            return err("Geeklist data missing in BGG response")
        }
        const result = Geeklist.safeParse(root.geeklist);
        if (result.success) {
            return ok(result.data);
        } else {
            return err(result.error.toString());
        }
    } else {
        console.log(validationResult);
        return err("Response from BGG API is not valid XML");
    }
}

// fetchGeekList("343756").then((a) => {
//     console.log(a);
// }).catch(err => {
//     console.error(err)
// });
console.time("parseWantlist");
const wantlist = readFileSync("../prev-data/343756-officialwants.txt", "utf8");
const pWantlist = transformWantlist(parseWantlist(wantlist));
console.timeEnd("parseWantlist");
const item = pWantlist.userWants["greatpopcorn"][0];
if (item.type === "singleWantlistItem") {
    console.log(`user wants ${pWantlist.officialNames[item.wants]}`);
    console.log("user gives any of the following:");
    console.log(item.gives.map(give => pWantlist.officialNames[give]).join("\n"));
}