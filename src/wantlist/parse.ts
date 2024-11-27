import {parse} from "./parser.js";
import {z} from "zod";
import {MultiWantlistItem, WantlistItem, WantlistJSON} from "./WantlistJSON.js";

const options = z.object({options: z.object({
    'LINEAR-PRIORITIES': z.optional(z.boolean()),
    'TRIANGLE-PRIORITIES': z.optional(z.boolean()),
    'SQUARE-PRIORITIES': z.optional(z.boolean()),
    'SCALED-PRIORITIES': z.optional(z.boolean()),
    'SMALL-STEP': z.optional(z.coerce.number()),
    'BIG-STEP': z.optional(z.coerce.number()),
    'ALLOW-DUMMIES': z.optional(z.boolean()),
    'ITERATIONS': z.optional(z.coerce.number()),
    'SEED': z.optional(z.coerce.number()),
    'REQUIRE-COLONS': z.optional(z.boolean()),
    'REQUIRE-USERNAMES': z.optional(z.boolean()),
    'HIDE-LOOPS': z.optional(z.boolean()),
    'HIDE-SUMMARY': z.optional(z.boolean()),
    'HIDE-NONTRADES': z.optional(z.boolean()),
    'HIDE-ERRORS': z.optional(z.boolean()),
    'HIDE-REPEATS': z.optional(z.boolean()),
    'HIDE-STATS': z.optional(z.boolean()),
    'SORT-BY-ITEM': z.optional(z.boolean()),
    'CASE-SENSITIVE': z.optional(z.boolean()),
    'SHOW-MISSING': z.optional(z.boolean()),
    'SHOW-ELAPSED-TIME': z.optional(z.boolean()),
    'NONTRADE-COST': z.optional(z.coerce.number()),
    'METRIC': z.optional(z.enum(["Chain-Sizes-SOS", "Users-Trading"])),
    'VERBOSE': z.optional(z.boolean()),
})});

const officialNames = z.object({
    officialNames: z.array(z.object({
        id: z.string(),
        friendly: z.string(),
    }))
});

const wantlistEntry = z.object({
    username: z.string(),
    giving: z.string(),
    wants: z.array(z.string()),
});

const parsedWantlist = z.array(z.union([officialNames, wantlistEntry, options]));

interface Wantlist {
    options: z.infer<typeof options>["options"];
    officialNames?: z.infer<typeof officialNames>["officialNames"];
    wants: Array<z.infer<typeof wantlistEntry>>;
}

export function parseWantlist(wantlist: string): Wantlist {
    const output = parsedWantlist.parse(parse(wantlist));
    let ret: Wantlist = {
        options: {},
        wants: []
    };
    output.forEach((item) => {
        if ('officialNames' in item) {
            ret.officialNames = item.officialNames;
        } else if ('username' in item) {
            ret.wants.push(item);
        } else {
            ret.options = item.options;
        }
    });
    return ret;
}

export function transformWantlist(wantlist: Wantlist): WantlistJSON {
    let map = new Map<string, Map<string, WantlistItem>>();
    wantlist.wants.forEach(entry => {
        if (!map.has(entry.username)) {
            map.set(entry.username, new Map());
        }
        const userWants = map.get(entry.username)!;
        if (entry.giving.startsWith("%")) {
            if (!userWants.has(entry.giving)) {
                userWants.set(entry.giving, {
                    type: "multiWantlistItem",
                    alias: entry.giving,
                    wants: entry.wants,
                    gives: [],
                    quantity: 1,
                });
            } else {
                (userWants.get(entry.giving)! as MultiWantlistItem).wants.push(...entry.wants);
            }
            return;
        }
        entry.wants.forEach(want => {
            if (!userWants.has(want)) {
                if (want.startsWith("%")) {
                    userWants.set(want, {
                        type: "multiWantlistItem",
                        alias: want,
                        wants: [],
                        gives: [],
                        quantity: 1,
                    });
                } else {
                    userWants.set(want, {
                        type: "singleWantlistItem",
                        wants: want,
                        gives: [],
                    });
                }
            }
            userWants.get(want)!.gives.push(entry.giving);
        });
    });
    return {
        options: wantlist.options,
        officialNames: Object.fromEntries(wantlist.officialNames?.map(entry => [entry.id, entry.friendly]) ?? []),
        userWants: Object.fromEntries([...map.entries()].map(([username, wantMap]) => {
            return [
                username,
                [...wantMap.values()]
            ]
        }))
    };
}