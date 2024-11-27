import {z} from 'zod';
const GeeklistAttr = z.object({
    id: z.coerce.number(),
    termsofuse: z.string(),
});
const bggDateTime = z.string().transform((arg) => {
    return new Date(arg);
});
const Item = z.object({
    body: z.string(),
    attr: z.object({
        id: z.string(),
        objecttype: z.enum(["thing"]),
        subtype: z.enum(["boardgame", "rpgitem", "videogame"]),
        objectid: z.string(),
        objectname: z.string(),
        username: z.string(),
        postdate: bggDateTime,
        editdate: bggDateTime,
        thumbs: z.coerce.number(),
        imageid: z.string(),
    })
});
export const Geeklist = z.object({
    attr: GeeklistAttr,
    postdate: bggDateTime,
    editdate: bggDateTime,
    thumbs: z.number(),
    numitems: z.number(),
    username: z.string(),
    title: z.string(),
    description: z.string(),
    item: z.array(Item)
});
